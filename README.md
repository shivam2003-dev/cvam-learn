# cvam.learn

Hands-on learning platform: visual roadmaps, lesson paths with quizzes, and graded practice problems. Progress is stored in the browser.

Live at https://learn.shivam2003.com

## Develop

```sh
npm install
npm run dev
```

## Content

- `src/content/<course>/curriculum.ts`: modules and lessons
- `src/content/<course>/lessons/`: lesson files, registered in `lessons/index.ts`
- `src/content/inference-engineering/problems.ts`: practice problems
- `scripts/sync_references.py`: refreshes each lesson's references from roadmap.sh
