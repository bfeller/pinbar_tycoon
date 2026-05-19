// ── Pineview Community College and Technical Institute ────────────────────────
// Automated completion emails from the distance-learning division.
// Tone: bureaucratically warm, vaguely proud, completely detached from reality.
// Suggested follow-up courses: plausible-sounding, entirely fictional, never
// available in the game.

export const universityEmails = [

  {
    id: 'uni_electronics',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Basic Electronics',
    body:
`Dear Valued Continuing Education Participant,

Congratulations! You have successfully completed ELEC 101: Basic Electronics.

Your certificate of completion is attached to this email as a 4.7MB file that we are legally required to tell you we cannot actually attach. Please print this email instead and write "CERTIFICATE" at the top in your preferred font.

You are now qualified to understand electricity in a general sense.

We would like to suggest the following courses to support your continued growth:

  • ELEC 210: Advanced Electromagnetics for the Spiritually Open-Minded
    Explore the intersection of waveforms and personal energy. No prior physics
    required. Some prior openness required.

  • ELEC 155: Electricity and You — A Partnership
    A six-week seminar on building a healthy relationship with electrical current.
    Includes a unit on forgiveness.

  • COMP 099: Circuits: Why They Work (A Theory)
    This course approaches circuit theory as a hypothesis rather than a certainty.
    We feel this is more honest.

Enrolment opens January 1st of a year to be confirmed. Places are extremely limited (we have estimated three).

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('electronics') && !sentIds.has('uni_electronics'),
    choices: null,
  },

  {
    id: 'uni_mixology',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Mixology',
    body:
`Dear Valued Continuing Education Participant,

You did it. HOSP 204: Mixology is behind you, and a world of beverages is ahead.

Please note that your certificate qualifies you to describe yourself as "mixology-adjacent" in professional contexts. We advise against "mixologist" until you have completed at least one more course in a liquid-related field.

Based on your academic profile, we recommend:

  • HOSP 310: Cocktails for When People Are Watching
    Advanced techniques for an audience. Emphasis on pouring posture and
    strategic garnish placement. Prerequisite: HOSP 204 (you have this).

  • HOSP 217: Mixology II — The Customer Is Wrong, But He's Still There
    A practicum-based exploration of compromise. Features a full module on
    the phrase "we can do a version of that."

  • FOOD 188: Ice: History, Philosophy, Applications
    Fourteen weeks on ice. Students consistently report this course "changed
    how they think about ice," which was the intended outcome.

We are proud of you in the way that an institution can be proud, which is to say: we have noted your completion in the system and the system has responded neutrally.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('mixology') && !sentIds.has('uni_mixology'),
    choices: null,
  },

  {
    id: 'uni_quantum',
    from: 'Dr. H. Pemberton, Dean of Continuing Education',
    address: 'hal.pemberton@pcced.edu',
    subject: 'Re: Your Completion of Quantum Physics — Personal Note',
    body:
`Dear Graduate,

I wanted to reach out personally, as Dean, because not many students complete PHYS 301: Quantum Physics through our distance-learning division. Most stop after week two, when the uncertainty principle becomes, in their words, "too relatable."

You kept going. That means something. I'm not sure what, but I've asked the physics department and they say meaning is also uncertain at the subatomic level, so perhaps that's appropriate.

I would like to suggest the following advanced offerings:

  • PHYS 302: Quantum Physics II — More Physics, Equally Quantum
    A continuation. We have been assured by the instructor that this one
    "resolves some things from the first course," though he seemed uncertain.

  • PHIL 240: The Physics of Feelings
    An interdisciplinary course co-taught by the Physics and Wellness
    departments following a misunderstanding about room bookings that
    we decided to lean into.

  • PHIL 099: Observational Uncertainty as a Life Philosophy
    You looked at the electron. The electron changed. This course asks:
    what does that mean for you, personally, going forward?

Please do not reply to this email directly. I sent it from my personal account by mistake.

With institutional warmth,
Dr. Harold Pemberton
Dean of Continuing Education
Pineview Community College and Technical Institute`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('quantum') && !sentIds.has('uni_quantum'),
    choices: null,
  },

  {
    id: 'uni_marketing',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Marketing 101',
    body:
`Dear Valued Continuing Education Participant,

MKTG 101: Marketing 101 is complete. You are now a marketer.

We have taken the liberty of updating your file. Your file previously said "no marketing training." It now says "marketing training (basic)." This is a meaningful distinction.

We encourage you to consider the following next steps:

  • MKTG 102: Marketing 102 — More Marketing
    Building on the foundational concepts of Marketing 101, this course
    introduces additional marketing. Prerequisite: Marketing 101 (you have it).

  • MKTG 215: Viral Strategy for Businesses That Have Not Gone Viral
    A compassionate course. Week one is titled "Acceptance." The remaining
    weeks are titled "Strategy." The course notes acknowledge the ordering
    may feel backwards.

  • BUSI 177: Branding Yourself — A Workshop for People Who Read One Book
    About Branding
    We developed this course in response to demand. Demand was high.
    We have questions about that, but here we are.

Your certificate is valid for life, or until the field of marketing changes substantially, whichever comes first. Our legal team has noted that marketing changes substantially every 18 months. We are looking into this.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('marketing') && !sentIds.has('uni_marketing'),
    choices: null,
  },

  {
    id: 'uni_psychology',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Consumer Psychology',
    body:
`Dear Valued Continuing Education Participant,

Congratulations on completing PSYC 220: Consumer Psychology.

You now understand, at a foundational level, why people buy things they do not need. We trust you will use this responsibly. We are legally required to add: we have no mechanism to enforce this.

The following courses may interest you:

  • PSYC 320: Advanced Consumer Psychology — Still Influencing, But Ethically
    A course about drawing the line. The line is discussed extensively in
    weeks one through four. Weeks five through fourteen are about techniques.
    The department is aware of how this looks.

  • PSYC 240: The Mind of the Shopper — They Don't Know What They Want
    An honest course. The title comes from a quote by our department chair,
    taken slightly out of context. She has asked us to add that.

  • MGMT 190: Nudge Theory — Pushing People Without Touching Them
    Behavioural economics for the everyday business owner. Week three
    contains a sub-module called "The Nudge vs. The Shove: A Legal Overview."
    Attendance for that week is mandatory.

We look forward to your continued enrolment. You have, statistically, a 34% chance of taking another course with us. We know this because of Consumer Psychology.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('psychology') && !sentIds.has('uni_psychology'),
    choices: null,
  },

  {
    id: 'uni_electrical_eng',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Electrical Engineering',
    body:
`Dear Valued Continuing Education Participant,

ENGR 310: Electrical Engineering is complete. This is a significant achievement. The course has a 41% completion rate, which our marketing materials describe as "selective" and our student services team describes as "a known issue we are addressing."

You are in the 41%. Welcome.

We recommend the following advanced pathways:

  • ENGR 410: Electrical Engineering II — Higher Voltage, Similar Risks
    The follow-up to ENGR 310. The curriculum committee has confirmed that
    the risks are not actually similar. This title is aspirational.

  • ENGR 225: Advanced Wiring for Non-Electricians Who Feel Confident
    Designed for a specific type of student. You may know someone like this.
    You may be someone like this. Either way, this course is for them/you.

  • HIST 301: The History of Switches — An Appreciation
    A thirteen-week humanities elective cross-listed with Engineering.
    The switch, this course argues, is underappreciated. By the end,
    most students agree. The remaining students transferred to the
    History of Levers course, which is also available.

Your certificate comes with an embossed seal. The embossed seal is described on our website. The physical seal is not included. The description is available any time.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('electrical_eng') && !sentIds.has('uni_electrical_eng'),
    choices: null,
  },

  {
    id: 'uni_social_media',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Social Media Marketing',
    body:
`Dear Valued Continuing Education Participant,

You have completed MKTG 250: Social Media Marketing.

We are sending this notification via email, which we acknowledge is not social media. We looked into sending it via social media and encountered several platform-specific barriers that we feel underscore the importance of the course you just completed.

For continued growth, we suggest:

  • MKTG 251: Social Media Marketing II — More Posts, Different Times
    An evidence-based exploration of posting frequency and optimal windows.
    Week six is entirely about Tuesdays at 11am. Students call it
    "the Tuesday module." We have considered renaming it. We have not.

  • MKTG 260: The Algorithm — Understanding Your Enemy
    This course frames the algorithm as an adversarial relationship and
    builds from there. The instructor previously worked in the algorithm.
    He does not discuss this in class. We have asked.

  • COMM 188: Content Creation for People Who Have Nothing to Say
    Our most popular course. Waitlist currently sits at 340 students.
    Enrolment is first-come, first-served, except for alumni, who are
    second-come, still served.

We have shared this email with our social accounts as an example of institutional communication. It received four likes. We are analysing this.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('social_media') && !sentIds.has('uni_social_media'),
    choices: null,
  },

  {
    id: 'uni_supply_chain',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Supply Chain Management',
    body:
`Dear Valued Continuing Education Participant,

MGMT 280: Supply Chain Management is complete. Your certificate is in transit.

We appreciate the irony and want you to know it was not intentional. The certificates are printed off-site at a facility we chose for cost reasons. The lead time is six to eight weeks. We are aware that this reflects poorly on a Supply Chain Management certificate specifically. The curriculum committee has been notified.

In the meantime, we recommend:

  • MGMT 281: Supply Chain Management II — The Remaining Chain
    Covers the parts of the supply chain that MGMT 280 described as
    "out of scope." Students frequently ask what was out of scope.
    This course is the answer.

  • MGMT 195: Logistics — Getting Things From Places to Other Places
    A foundational course for those who feel the supply chain metaphor
    is too abstract and would prefer a more literal framing. Suitable
    for all levels. Brings its own clarity.

  • PSYC 210: Warehouse Anxiety and How to Channel It
    Cross-listed with Psychology. Developed in response to student feedback
    from MGMT 280. Attendance is voluntary. Completion rates are high,
    which the Psychology department finds significant.

Your physical certificate, once it arrives, will feature your name in a font we describe as "distinguished." It is Times New Roman.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('supply_chain') && !sentIds.has('uni_supply_chain'),
    choices: null,
  },

  {
    id: 'uni_charm',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Hospitality & Charm',
    body:
`Dear Valued Continuing Education Participant,

Congratulations on completing HOSP 150: Hospitality & Charm.

We would like to say that it has been a genuine pleasure having you in our distance-learning cohort. We would also like to clarify that "distance-learning cohort" means you completed modules independently via a login portal and there were no other students in any meaningful sense. But the sentiment stands.

We recommend the following for your continued journey:

  • HOSP 250: Advanced Charm — When Charm Isn't Enough
    The honest follow-up. Prerequisite: HOSP 150. Also prerequisite:
    a situation that HOSP 150 did not resolve. The course assumes
    you have encountered one of these. Most students have.

  • HOSP 160: Service with a Smile — The Smile Module
    Originally part of HOSP 150, the Smile Module was separated into
    its own course after students reported it "deserved more time."
    It is now seven weeks long. It covers one expression.

  • PSYC 195: Boundary Setting in Hospitality Contexts
    A course about saying no warmly. Co-developed with the Psychology
    department after a series of conversations with the Hospitality
    department that the Psychology department found concerning.
    Offered once yearly, usually in spring.

You are, on paper, charming. We wish you well.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('charm') && !sentIds.has('uni_charm'),
    choices: null,
  },

  {
    id: 'uni_liquor_licensing',
    from: 'Pineview CC — Certificates Office',
    address: 'certificates@pcced.edu',
    subject: 'Certificate of Completion: Liquor Licensing',
    body:
`Dear Valued Continuing Education Participant,

Congratulations. You have completed BUSI 320: Liquor Licensing.

Your establishment is now, to the best of our knowledge, operating within the parameters described in Module 4. Module 4, you may recall, was the long one. We appreciate your patience with Module 4.

Your licence is in the mail. Please allow 6 to 8 weeks for delivery. We have been advised not to explain what happens if it doesn't arrive. If it doesn't arrive, please do not reply to this email.

Based on your completion profile, we recommend the following for continued compliance:

  • LEGL 215: Zoning Law for the Genuinely Confused
    A practical course for business owners who received a letter from the city
    and did not understand it. All modules are titled "What This Means For You."
    What it means for you varies. The course addresses this.

  • LEGL 330: Fire Code Compliance — What's Actually Required
    The instructors of this course want you to know that the full fire code
    is not covered. What is covered is the part that affects you personally.
    Week nine is an exception. Week nine covers things that affect other people.
    Students have called it "clarifying."

  • BUSI 285: Extended Hours Operations — A Practical Overview
    For businesses newly permitted to stay open later. Covers staffing,
    liability, the emotional labour of closing time, and one week on why
    the last customer always arrives at the worst moment. This is not a
    coincidence, the course argues. The data is in week six.

We wish you extended and compliant operating hours.

Warmly,
The Office of Certificates and Continuing Achievement
Pineview Community College and Technical Institute

"Learning: It's Ongoing"`,
    trigger: ({ completedCourseIds, sentIds }) =>
      completedCourseIds?.has('liquor_licensing') && !sentIds.has('uni_liquor_licensing'),
    choices: null,
  },

];
