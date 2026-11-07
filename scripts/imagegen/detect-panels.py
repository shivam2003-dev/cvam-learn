"""Find the numbered panels on each FDE study sheet and write their bounding boxes
(as fractions of the sheet) to src/content/courseware/fde/visuals/panels.json.

XY-cut on the cream gutters between the bordered panels. Sheets whose detected
panel count does not match diagram-notes.json are skipped and reported, so the
lesson keeps its text fallback instead of showing a bad crop.
"""
import json, os
import numpy as np
from PIL import Image

ROOT = "public/images/courseware/fde"
NOTES = json.load(open("src/content/courseware/fde/visuals/diagram-notes.json"))
MIN_GAP = 6          # px of empty gutter that separates two regions
INK = 38             # per-channel difference from the paper colour that counts as ink
EDGE = 0.004         # a row/column with less ink than this fraction is empty


def ink_mask(img, ink=None):
    a = np.asarray(img.convert("RGB")).astype(int)
    bg = np.median(a[:12, :12].reshape(-1, 3), axis=0)
    return (np.abs(a - bg).max(axis=2) > (ink or INK))


def gaps(profile, lo, hi, thresh, min_gap=None):
    """Runs of empty rows/cols strictly inside (lo, hi) that are long enough to cut at."""
    empty = profile[lo:hi] <= thresh
    runs, start = [], None
    for i, e in enumerate(empty):
        if e and start is None:
            start = i
        if (not e or i == len(empty) - 1) and start is not None:
            end = i if e else i
            if e and i == len(empty) - 1:
                end = i + 1
            runs.append((lo + start, lo + end))
            start = None
    return [r for r in runs if r[1] - r[0] >= (min_gap or MIN_GAP) and r[0] > lo and r[1] < hi]


def trim(mask, x0, y0, x1, y1):
    sub = mask[y0:y1, x0:x1]
    rows = np.where(sub.any(axis=1))[0]
    cols = np.where(sub.any(axis=0))[0]
    if len(rows) == 0:
        return None
    return x0 + cols[0], y0 + rows[0], x0 + cols[-1] + 1, y0 + rows[-1] + 1


PARAMS = {'edge': EDGE, 'gap': MIN_GAP}


def cut(mask, box, out, depth=0, max_depth=6):
    box = trim(mask, *box)
    if box is None:
        return
    x0, y0, x1, y1 = box
    sub = mask[y0:y1, x0:x1]
    rowp = sub.mean(axis=1)
    colp = sub.mean(axis=0)
    ry = gaps(rowp, 0, len(rowp), PARAMS['edge'], PARAMS['gap'])
    cx = gaps(colp, 0, len(colp), PARAMS['edge'], PARAMS['gap'])
    if depth < max_depth and (ry or cx):
        # cut along the widest gutter first
        best_y = max(ry, key=lambda r: r[1] - r[0], default=None)
        best_x = max(cx, key=lambda r: r[1] - r[0], default=None)
        if best_y and (not best_x or best_y[1] - best_y[0] >= best_x[1] - best_x[0]):
            a, b = best_y
            cut(mask, (x0, y0, x1, y0 + a), out, depth + 1, max_depth)
            cut(mask, (x0, y0 + b, x1, y1), out, depth + 1, max_depth)
            return
        a, b = best_x
        cut(mask, (x0, y0, x0 + a, y1), out, depth + 1, max_depth)
        cut(mask, (x0 + b, y0, x1, y1), out, depth + 1, max_depth)
        return
    out.append(box)


def panels_top(img, W, H):
    """Row where the first panel border starts; everything above is the title banner."""
    mask = ink_mask(img, 60)
    frac = mask.mean(axis=1)
    for y in range(int(H * 0.04), int(H * 0.25)):
        if frac[y] > 0.45:
            return max(0, y - 6)
    return int(H * 0.1)


def bordered(mask, b):
    """A real panel has a drawn border along both its top and bottom edge."""
    x0, y0, x1, y1 = b
    def line(y):
        lo, hi = max(0, y - 4), min(mask.shape[0], y + 5)
        return mask[lo:hi, x0:x1].mean(axis=1).max() >= 0.55
    return line(y0 + 2) and line(y1 - 3)


def layout_2_1(img, W, H):
    """Two panels side by side with one full-width panel underneath."""
    mask = ink_mask(img, 60)
    ytop = panels_top(img, W, H)
    ysplit = valley(mask.mean(axis=1), int(H * 0.5), int(H * 0.78))
    xsplit = valley(mask[ytop:ysplit, :].mean(axis=0), int(W * 0.4), int(W * 0.6))
    return [(0, ytop, xsplit, ysplit), (xsplit, ytop, W, ysplit), (0, ysplit, W, H)]


MANUAL = {"how-fde-interviews-work": layout_2_1}


def plausible(cand, W, H, mask=None):
    areas = [(b[2] - b[0]) * (b[3] - b[1]) for b in cand]
    med = sorted(areas)[len(areas) // 2]
    ok = all((b[3] - b[1]) >= H * 0.12 and (b[2] - b[0]) >= W * 0.2 and a >= 0.3 * med
             for b, a in zip(cand, areas))
    return ok and (mask is None or all(bordered(mask, b) for b in cand))


def valley(profile, lo, hi):
    k = max(5, (hi - lo) // 60)
    sm = np.convolve(profile, np.ones(k) / k, mode="same")
    return lo + int(np.argmin(sm[lo:hi]))


def grid_2x2(img, W, H):
    """Fallback for tightly packed 2x2 sheets: cut at the ink valleys near the middle."""
    mask = ink_mask(img, 60)
    ytop = panels_top(img, W, H)
    sub = mask[ytop:, :]
    ymid = ytop + valley(sub.mean(axis=1), int(sub.shape[0] * 0.4), int(sub.shape[0] * 0.6))
    xmid = valley(mask[ytop:, :].mean(axis=0), int(W * 0.4), int(W * 0.6))
    return [(0, ytop, xmid, ymid), (xmid, ytop, W, ymid), (0, ymid, xmid, H), (xmid, ymid, W, H)]


RELAXED = []


def main():
    result, skipped = {}, {}
    for lesson, data in NOTES.items():
        path = f"{ROOT}/{lesson}.webp"
        if not os.path.exists(path):
            skipped[lesson] = "no image"
            continue
        img = Image.open(path)
        W, H = img.size
        want = len(data["panels"])
        ytop = panels_top(img, W, H)
        manual = MANUAL[lesson](img, W, H) if lesson in MANUAL else None
        panels = manual
        for strict in (True, False):
          if panels:
            break
          for ink, edge, gap in ((INK, EDGE, MIN_GAP), (60, 0.01, 4), (80, 0.02, 3), (50, 0.03, 4), (90, 0.05, 3)):
            mask = ink_mask(img, ink)
            PARAMS["edge"], PARAMS["gap"] = edge, gap
            for max_depth in (0, 1, 2, 3, 4):
                leaves = []
                cut(mask, (0, ytop, W, H), leaves, 0, max_depth)
                cand = [b for b in leaves
                        if (b[2] - b[0]) * (b[3] - b[1]) > W * H * 0.04
                        ]
                cand.sort(key=lambda b: (round(b[1] / (H * 0.12)), b[0]))
                if len(cand) == want and plausible(cand, W, H, mask if strict else None):
                    panels = cand
                    if not strict:
                        RELAXED.append(lesson)
                    break
            if panels:
                break
        if panels is not None and want == 4:
            areas = [(b[2] - b[0]) * (b[3] - b[1]) for b in panels]
            if min(areas) < 0.5 * max(areas):
                panels = None
        if panels is None and want == 4:
            panels = grid_2x2(img, W, H)
        if panels is None:
            skipped[lesson] = f"no depth matched {want}"
            continue
        pad = 6
        result[lesson] = [
            {"x": round(max(0, b[0] - pad) / W, 4), "y": round(max(0, b[1] - pad) / H, 4),
             "w": round((min(W, b[2] + pad) - max(0, b[0] - pad)) / W, 4),
             "h": round((min(H, b[3] + pad) - max(0, b[1] - pad)) / H, 4)}
            for b in panels
        ]
    json.dump(result, open("src/content/courseware/fde/visuals/panels.json", "w"), indent=1)
    print("ok", len(result), "skipped", len(skipped), "relaxed", RELAXED)
    for k, v in list(skipped.items())[:40]:
        print("  skip", k, v)


main()
