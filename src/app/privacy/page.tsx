import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How cvam.learn handles your data: browser storage, optional sign-in, cookies, Google AdSense advertising, and your rights under the GDPR, UK GDPR, CCPA/CPRA and other laws.",
};

const SITE = "https://learn.shivam2003.com";
const CONTACT = "shivam.sk2003@gmail.com";
const UPDATED = "5 November 2026";

const sections = [
  { id: "who", title: "Who we are" },
  { id: "scope", title: "What this policy covers" },
  { id: "collect", title: "Information we collect" },
  { id: "use", title: "How and why we use it" },
  { id: "cookies", title: "Cookies and local storage" },
  { id: "ads", title: "Advertising and Google AdSense" },
  { id: "sharing", title: "Who we share data with" },
  { id: "transfers", title: "International transfers" },
  { id: "retention", title: "How long we keep data" },
  { id: "rights", title: "Your rights" },
  { id: "us", title: "United States residents" },
  { id: "other", title: "Other countries" },
  { id: "children", title: "Children" },
  { id: "security", title: "Security" },
  { id: "dnt", title: "Do Not Track and Global Privacy Control" },
  { id: "links", title: "Links to other sites" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 scroll-mt-20 border-b border-line pb-2 font-display text-2xl font-bold tracking-tight"
    >
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="font-mono text-sm text-lime">{"// legal"}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 font-mono text-sm text-faint">Last updated: {UPDATED}</p>
        <p className="mt-5 text-lg text-soft">
          This policy explains what personal data <strong className="text-text">cvam.learn</strong>{" "}
          ({SITE.replace("https://", "")}) collects, why, who sees it, how long we keep it, and the
          choices and rights you have. We have tried to keep it plain. Short version: we collect very
          little, we do not sell personal data, and the only third parties involved are our hosting
          and sign-in providers and, if ads are shown, Google.
        </p>

        <nav aria-label="Contents" className="mt-8 rounded-2xl border border-line bg-panel p-5">
          <p className="font-mono text-xs tracking-wider text-faint uppercase">Contents</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-soft hover:text-text">
                  <span className="mr-2 font-mono text-xs text-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lesson-copy mt-4">
          <H2 id="who">1. Who we are</H2>
          <p>
            cvam.learn is an educational website offering learning paths, courseware, roadmaps and
            practice problems for engineers. It is run by an individual, <strong>Shivam Kumar</strong>{" "}
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;), who is the <em>data controller</em> for personal data
            processed through the site. Contact details are in{" "}
            <a href="#contact">section 18</a>.
          </p>

          <H2 id="scope">2. What this policy covers</H2>
          <p>
            This policy applies to {SITE.replace("https://", "")} and its pages (lessons, courseware,
            roadmaps, practice problems and this policy). It does not cover other websites we link to,
            including{" "}
            <a href="https://shivam2003.com" rel="noopener noreferrer">
              shivam2003.com
            </a>
            , which has its own policy, or the websites of advertisers and service providers.
          </p>

          <H2 id="collect">3. Information we collect</H2>
          <h3>3.1 You can use most of the site without an account</h3>
          <p>
            Browsing lessons, roadmaps and practice problems does not require you to give us any
            personal data.
          </p>
          <h3>3.2 Data stored in your own browser</h3>
          <p>
            To remember your progress, the site stores a small record in your browser&apos;s local
            storage under the key <code>cvam-learn:v1</code>: which lessons you finished, quiz scores,
            practice problems solved, and the dates you were active (used for XP, level and streak).
            This data stays on your device unless you choose to sign in (see 3.3). We also store small
            flags to remember whether you dismissed a notice (<code>cvam-learn:promo:*</code>). You
            can delete all of it at any time by clearing your browser&apos;s site data.
          </p>
          <h3>3.3 Optional sign-in with Google</h3>
          <p>
            If you choose <em>Sign in with Google</em> to sync progress across devices, authentication
            is handled by our backend provider (Supabase) using Google as the identity provider. We
            receive and store: your Google account identifier, your name, your email address and your
            profile picture URL as provided by Google, and a copy of your learning progress. We never
            receive your Google password.
          </p>
          <h3>3.4 Technical data from hosting</h3>
          <p>
            Like any website, our hosting provider (Vercel) processes technical data when your browser
            requests a page: IP address, request time, requested URL, browser and device information
            (user agent), and referring page. This is used to deliver the site, protect it from abuse
            and diagnose errors.
          </p>
          <h3>3.5 Advertising data</h3>
          <p>
            If ads are displayed, Google and its partners may collect and use data such as cookie or
            device identifiers, IP address, approximate location, and information about the ads you
            see or interact with. See <a href="#ads">section 6</a>.
          </p>
          <h3>3.6 Messages you send us</h3>
          <p>
            If you email us, we keep the message and your email address so we can reply.
          </p>
          <p>
            We do not knowingly collect special-category data (such as health or biometric data), and
            we ask that you do not send it to us.
          </p>

          <H2 id="use">4. How and why we use it</H2>
          <p>
            Where the GDPR or UK GDPR applies, we rely on these legal bases:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Purpose</th>
                  <th scope="col">Data</th>
                  <th scope="col">Legal basis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Remember your progress in your browser</td>
                  <td>Local storage record</td>
                  <td>Strictly necessary for a feature you requested; no consent needed under ePrivacy rules for storage that is essential to the service you use</td>
                </tr>
                <tr>
                  <td>Sign you in and sync progress across devices</td>
                  <td>Google profile data, progress</td>
                  <td>Performance of the service you ask for (contract) and your consent when you press sign in</td>
                </tr>
                <tr>
                  <td>Deliver, secure and debug the site</td>
                  <td>IP address, logs, device data</td>
                  <td>Legitimate interests (running a secure, working website)</td>
                </tr>
                <tr>
                  <td>Show advertising (if enabled)</td>
                  <td>Cookie identifiers, ad interaction data</td>
                  <td>Consent, where required (EEA, UK, Switzerland); otherwise legitimate interests in funding the site</td>
                </tr>
                <tr>
                  <td>Respond to your messages; comply with law</td>
                  <td>Email and message content</td>
                  <td>Legitimate interests; legal obligation</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We do not use your data for automated decisions that have legal or similarly significant
            effects, and we do not sell your personal data.
          </p>

          <H2 id="cookies">5. Cookies and local storage</H2>
          <p>
            Cookies and similar technologies (such as local storage) are small pieces of data stored
            on your device.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Name or source</th>
                  <th scope="col">Type</th>
                  <th scope="col">Purpose</th>
                  <th scope="col">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>cvam-learn:v1</code> (local storage)</td>
                  <td>Essential</td>
                  <td>Your learning progress, XP and streak</td>
                  <td>Until you clear browser data</td>
                </tr>
                <tr>
                  <td><code>cvam-learn:promo:*</code> (local and session storage)</td>
                  <td>Essential / preference</td>
                  <td>Remembers that you dismissed or hid a notice</td>
                  <td>Session, or until cleared</td>
                </tr>
                <tr>
                  <td>Supabase authentication entries (local storage)</td>
                  <td>Essential, only if you sign in</td>
                  <td>Keeps you signed in</td>
                  <td>Until you sign out or they expire</td>
                </tr>
                <tr>
                  <td>Google AdSense and Google advertising cookies</td>
                  <td>Advertising, only if ads are shown and (where required) you consent</td>
                  <td>Serve and measure ads; limit repeats; prevent fraud</td>
                  <td>Set by Google; see their policies</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Where law requires consent for non-essential cookies (for example in the European Economic
            Area, the United Kingdom and Switzerland), we do not set advertising cookies until you
            agree through a consent banner, and you can change or withdraw your choice at any time.
            You can also block or delete cookies in your browser settings; the essential features
            above will still work for browsing, but progress that lives in local storage will be lost
            if you delete it.
          </p>

          <H2 id="ads">6. Advertising and Google AdSense</H2>
          <p>
            This site may display advertisements served by <strong>Google AdSense</strong> to help pay
            for hosting and content. The following applies when ads are shown:
          </p>
          <ul>
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s
              prior visits to this website or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies (including the DoubleClick cookie) enables it
              and its partners to serve ads to you based on your visit to this site and/or other sites
              on the internet.
            </li>
            <li>
              You can opt out of personalised advertising by visiting{" "}
              <a href="https://adssettings.google.com" rel="noopener noreferrer">
                Google Ads Settings
              </a>
              . You can also opt out of some third-party vendors&apos; use of cookies for personalised
              advertising at{" "}
              <a href="https://www.aboutads.info" rel="noopener noreferrer">
                www.aboutads.info
              </a>{" "}
              (US), the{" "}
              <a href="https://www.youronlinechoices.com" rel="noopener noreferrer">
                Your Online Choices
              </a>{" "}
              site (EU), or the{" "}
              <a href="https://youradchoices.ca" rel="noopener noreferrer">
                Digital Advertising Alliance of Canada
              </a>
              .
            </li>
            <li>
              To learn how Google uses information from sites that use its services, see{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                rel="noopener noreferrer"
              >
                How Google uses information from sites or apps that use our services
              </a>
              . Google&apos;s general privacy policy is at{" "}
              <a href="https://policies.google.com/privacy" rel="noopener noreferrer">
                policies.google.com/privacy
              </a>
              .
            </li>
            <li>
              A list of the ad technology providers whose cookies may be used with Google ads is at{" "}
              <a href="https://support.google.com/admanager/answer/94149" rel="noopener noreferrer">
                support.google.com/admanager/answer/94149
              </a>
              .
            </li>
            <li>
              Visitors in the EEA, UK and Switzerland are asked for consent before personalised ads
              are served, using a consent management platform that follows the IAB Transparency and
              Consent Framework. If you do not consent, you may see non-personalised ads, which are
              based on the content of the page and your general location rather than your browsing
              history.
            </li>
          </ul>
          <p>
            We do not control the cookies set by Google or advertisers and do not have access to
            them. We do not place ads on pages that are in a state of construction, contain no
            content, or are used to display private account information.
          </p>

          <H2 id="sharing">7. Who we share data with</H2>
          <p>We share personal data only with service providers that help us run the site (processors) and, for advertising, with Google:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Provider</th>
                  <th scope="col">Role</th>
                  <th scope="col">Data</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vercel Inc.</td>
                  <td>Website hosting and delivery</td>
                  <td>Technical and request data (IP, user agent, URLs)</td>
                </tr>
                <tr>
                  <td>Supabase Inc.</td>
                  <td>Authentication and database for synced progress (only if you sign in)</td>
                  <td>Account identifier, email, name, avatar URL, progress</td>
                </tr>
                <tr>
                  <td>Google LLC / Google Ireland Ltd.</td>
                  <td>Sign-in identity provider; advertising (AdSense) if enabled</td>
                  <td>Authentication tokens; ad-related identifiers and interaction data</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We may also disclose information if required by law, to protect our rights or users, or in
            connection with a sale or reorganisation of the site, in which case the same protections
            would continue to apply. We do not sell personal data for money.
          </p>

          <H2 id="transfers">8. International transfers</H2>
          <p>
            Our providers operate globally, so your data may be processed outside your country,
            including in the United States. Where the GDPR or UK GDPR applies, transfers rely on
            safeguards such as the EU-US Data Privacy Framework (for certified recipients), the
            European Commission&apos;s Standard Contractual Clauses, or the UK International Data
            Transfer Addendum, as provided in our providers&apos; data processing terms.
          </p>

          <H2 id="retention">9. How long we keep data</H2>
          <ul>
            <li><strong>Browser storage:</strong> until you clear it. We cannot see it.</li>
            <li><strong>Account and synced progress:</strong> while your account exists. You can ask us to delete it at any time; we will do so within 30 days.</li>
            <li><strong>Hosting logs:</strong> kept by our host for a limited period (typically days to a few weeks) and then deleted or anonymised.</li>
            <li><strong>Emails to us:</strong> up to 24 months after the conversation ends, unless a longer period is needed to meet legal obligations.</li>
            <li><strong>Advertising cookies:</strong> per Google&apos;s policies and the expiry set in each cookie.</li>
          </ul>

          <H2 id="rights">10. Your rights (EEA, UK, Switzerland)</H2>
          <p>
            If you are in the European Economic Area, the United Kingdom or Switzerland, you have the
            right to:
          </p>
          <ul>
            <li><strong>Access</strong> the personal data we hold about you and receive a copy.</li>
            <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
            <li><strong>Erase</strong> your data (&ldquo;right to be forgotten&rdquo;) in the cases the law provides.</li>
            <li><strong>Restrict</strong> processing in certain circumstances.</li>
            <li><strong>Data portability</strong>: receive your data in a structured, commonly used format.</li>
            <li><strong>Object</strong> to processing based on legitimate interests, and to direct marketing at any time.</li>
            <li><strong>Withdraw consent</strong> at any time, without affecting earlier lawful processing.</li>
            <li><strong>Lodge a complaint</strong> with your local data protection authority (for example the ICO in the UK, the CNIL in France, or the authority in your EU member state). A list for the EEA is at{" "}
              <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" rel="noopener noreferrer">edpb.europa.eu</a>.
            </li>
          </ul>
          <p>
            To exercise a right, email us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We may need to
            verify your identity and will respond within one month (extendable by two months for
            complex requests, with notice).
          </p>

          <H2 id="us">11. United States residents</H2>
          <h3>California (CCPA/CPRA) and other state laws</h3>
          <p>
            Residents of California and of states with comprehensive privacy laws (for example
            Virginia, Colorado, Connecticut, Utah, Texas, Oregon and others) may have these rights:
          </p>
          <ul>
            <li>to know what personal information we collect, use, disclose and share;</li>
            <li>to access and obtain a copy of it;</li>
            <li>to correct inaccurate information and to delete information we hold;</li>
            <li>to opt out of the <strong>sale or sharing</strong> of personal information, and of targeted advertising and profiling;</li>
            <li>to limit the use of sensitive personal information (we do not collect it for inferring characteristics);</li>
            <li>not to be discriminated against for exercising these rights; and</li>
            <li>to appeal a decision about a request, where state law provides an appeal.</li>
          </ul>
          <p>
            <strong>Categories collected in the last 12 months:</strong> identifiers (IP address,
            account ID, email, name), internet or network activity (pages viewed, progress), and
            inferences drawn from your use of the learning features. If ads are shown, advertising
            partners may collect identifiers and browsing activity. We do not sell personal
            information for money. However, under some state laws, allowing advertising cookies that
            enable cross-context behavioural advertising can count as &ldquo;sharing&rdquo; or
            &ldquo;targeted advertising&rdquo;. You can opt out at{" "}
            <a href="https://adssettings.google.com" rel="noopener noreferrer">
              Google Ads Settings
            </a>
            , through the consent or privacy choices control on the site when available, via browser
            settings, or by sending a{" "}
            <a href="https://globalprivacycontrol.org" rel="noopener noreferrer">
              Global Privacy Control
            </a>{" "}
            signal. To submit a request, email{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with the subject &ldquo;Privacy request&rdquo;.
            You may use an authorised agent, and we may verify your identity before acting.
          </p>
          <p>
            California&apos;s &ldquo;Shine the Light&rdquo; law allows California residents to ask
            about disclosures of personal information to third parties for their direct marketing; we
            do not make such disclosures.
          </p>

          <H2 id="other">12. Other countries</H2>
          <p>
            We aim to honour the privacy rights provided by the laws that apply to you. This includes,
            where applicable, Brazil (LGPD), Canada (PIPEDA and provincial laws), Australia (Privacy
            Act 1988 and the Australian Privacy Principles), India (Digital Personal Data Protection
            Act, 2023), Japan (APPI), South Korea (PIPA), Singapore (PDPA), South Africa (POPIA), New
            Zealand (Privacy Act 2020) and Switzerland (FADP). In general you may ask us to access,
            correct or delete your personal data, withdraw consent, or object to certain uses, and you
            may complain to your national privacy regulator. Contact us as described in{" "}
            <a href="#contact">section 18</a> and we will handle your request under the law that applies
            to you.
          </p>

          <H2 id="children">13. Children</H2>
          <p>
            The site is intended for a general audience of learners and is not directed to children
            under 13 (or under 16 where local law sets a higher age of digital consent). We do not
            knowingly collect personal data from children. If you believe a child has given us
            personal data, contact us and we will delete it. Google AdSense is not used to
            show personalised ads to users we know to be under the applicable age.
          </p>

          <H2 id="security">14. Security</H2>
          <p>
            We use reasonable technical and organisational measures, including encrypted connections
            (HTTPS), access controls and reputable providers, to protect personal data. No method of
            transmission or storage is completely secure, so we cannot guarantee absolute security.
            If a breach affects you, we will notify you and the authorities as required by law.
          </p>

          <H2 id="dnt">15. Do Not Track and Global Privacy Control</H2>
          <p>
            There is no common standard for &ldquo;Do Not Track&rdquo; browser signals, so the site
            does not respond to them. We treat a valid Global Privacy Control signal as a request to
            opt out of sale or sharing where the law requires it, to the extent we can control it.
            Third-party ad providers may handle such signals according to their own policies.
          </p>

          <H2 id="links">16. Links to other sites</H2>
          <p>
            Lessons and references link to third-party websites (documentation, articles, videos). We
            are not responsible for their content or privacy practices, and we encourage you to read
            their policies.
          </p>

          <H2 id="changes">17. Changes to this policy</H2>
          <p>
            We may update this policy as the site or the law changes (for example when advertising is
            switched on or a new provider is added). We will change the &ldquo;Last updated&rdquo;
            date above and, for material changes, give a more prominent notice. Continued use after an
            update means you accept the revised policy, except where the law requires fresh consent.
          </p>

          <H2 id="contact">18. Contact us</H2>
          <p>
            For privacy questions or to exercise your rights, contact Shivam Kumar at{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>, or through{" "}
            <a href="https://shivam2003.com" rel="noopener noreferrer">
              shivam2003.com
            </a>
            . This policy is available at{" "}
            <Link href="/privacy">{`${SITE}/privacy`}</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
