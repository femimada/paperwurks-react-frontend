User Flow: The Agent "Quick-Start" Workflow Persona: Sarah, an Estate
Agent at a small-to-medium UK firm. Goal: To accelerate a property sale
by preparing a comprehensive, AI-analyzed "Information Pack" as soon as
she wins a new listing.

Act I: Onboarding & First Engagement Scenario: Sarah has just won a new
instruction to sell a property at 123 Oak Street. She's frustrated with
how long the conveyancing process takes and has signed up for Paperwurks
to try and speed things up.

Discovery & Registration: User Action: Sarah sees a targeted LinkedIn ad
or finds the Paperwurks marketing site (code4.html) via a Google search.
The value proposition of "Accelerated Sales" and "Reduced Administrative
Burden" resonates with her. UI: She sees the professional landing page,
understands the benefits, and clicks "Get started." System Action: She
is directed to the registration page (code16.html), where she creates an
"Agent" account.

First Login & Dashboard Landing: User Action: Sarah logs in for the
first time via the login page (code5.html). UI: She lands on the Agent
Dashboard (code.html). It's clean and professional. She sees a welcome
message, a large "Order a new Paperwurks pack" call-to-action, and an
empty "My Properties" table. System Action: The application
authenticates her, fetches her user profile, and checks for any existing
property files (in this case, none).

Act II: The Core Loop - Creating a New Property File Scenario: Sarah is
ready to create the file for 123 Oak Street. She needs this process to
be incredibly fast.

Initiating the File: User Action: Sarah clicks the prominent "New Order"
button on her dashboard. UI: She is taken to the "Create Property File"
screen. This is a single-step, minimalist form based on our refactored
PropertyForm.tsx (inspired by code2.html but simplified). The focus is
immediately in the first input field.

The "Quick-Start" Data Entry: User Action: Sarah's cursor is in the
"Property Postcode" field. She types in the seller's postcode. UI: As
she types, a list of matching addresses appears below the input, powered
by the UK Address Autocomplete. System Action (Frontend): The
useUkAddressAutocomplete hook fires API calls on a debounce to fetch
suggestions.

The Magic Moment: User Action: Sarah selects "123 Oak Street, London,
SW1A 1AA" from the list. UI: The full address fields (line1, city,
postcode, etc.) are instantly and automatically populated.
Simultaneously, the "Property File Reference" field is auto-filled with
a sensible default: "123 Oak Street". System Action (Frontend): The
useEffect hook in PropertyForm.tsx detects the change in the address and
uses setValue to update the reference field.

Finalizing Creation: User Action: Sarah quickly reviews the auto-filled
data. She could edit the reference to "123 Oak St - Smith Sale" if she
wanted, but the default is fine. She selects the property's Tenure
(e.g., "Leasehold") from a simple dropdown. That's it. She clicks the
"Create Property File" button. UI: The button shows a loading spinner.
The form is disabled. System Action (Backend): The frontend (using
react-hook-form and zod) validates the three essential pieces of data.
On success, an API POST request is sent to /api/properties with the new
file data. The backend creates the new property record and returns the
new property object, including its unique ID. User Feedback: She sees
the success screen from PropertyCreatePage.tsx, which confirms "Property
Created!" and then automatically redirects her.

Act III: The Seller Interaction Scenario: The Property File for 123 Oak
Street now exists. Sarah's next job is to get the initial documents from
the seller, Mr. Smith.

Landing on the Property File Dashboard: UI: Sarah is redirected to the
PropertyDetailsPage.tsx for the new file. The page is in its "dashboard"
state. The "Documents" tab is the default, active view. It currently
shows an empty state message: "No documents have been uploaded." The
most prominent button on the page is "Invite Seller to Upload
Documents."

Sending the Invitation: User Action: Sarah clicks "Invite Seller...".
UI: A Dialog (modal) appears. It has two simple fields: "Seller's Name"
and "Seller's Email." User Action: She enters "John Smith" and his email
address. She clicks "Send Invitation." System Action (Backend): An API
POST request is sent to a /api/properties/{id}/invite-seller endpoint.
The backend generates a secure, single-use token and sends a branded
email to Mr. Smith. The email contains a clear call-to-action and a
unique link.

The Seller's Experience (A Separate, Simple Flow): User Action (Seller):
Mr. Smith receives the email on his phone. He clicks the link. UI: He is
taken to a simple, mobile-friendly, public-facing page (code7.html). He
does not need to log in or create an account. The page clearly states,
"Sarah from ABC Estates has requested the following documents for 123
Oak Street." It shows a list of required documents (e.g., Title Plan,
EPC) and a large drag-and-drop upload area. User Action (Seller): He
uploads the files from his computer. He sees a progress bar for each
file and gets a clear "Upload Complete" message when finished.

Act IV: The Payoff - AI Analysis & Review Scenario: The system now has
the documents it needs to provide value.

Automated Analysis: System Action (Backend): As soon as Mr. Smith's
documents are successfully uploaded, the backend automatically triggers
the AI analysis pipeline. UI (Sarah's View): Back on her
PropertyDetailsPage, Sarah sees the documents appear in the DocumentList
(DataTable). Their status badge initially reads "Processing Analysis."
She receives a notification in her header (code9.html style).

The "Analysis Complete" Notification: User Action: A short time later, a
new notification appears: "AI analysis for '123 Oak Street' is
complete." UI: The status badges next to the documents now say "Review
Ready." A new tab, "Findings Report," might now become enabled or
highlighted.

Reviewing the Insights: User Action: Sarah clicks on a key document,
like the "Lease Agreement." UI: She is taken to the Document Viewer
(code1.html). This is the core value proposition in action. She sees the
PDF of the lease on the left. On the right, she sees the "AI Highlights
& Annotations" panel, which lists out key findings like "High-Risk
Issue: Short lease term" and "Key Clause: Repairing Covenants." User
Action: She clicks on a finding in the right-hand panel. The document on
the left automatically scrolls to the exact highlighted passage in the
text. She can now add her own comments.

Act V: Sharing & Accelerating the Sale Scenario: Sarah has reviewed the
AI findings and is confident in the Information Pack. A potential buyer
is interested.

Generating a Secure Share Link: User Action: From the
PropertyDetailsPage, Sarah clicks the "Share" button. UI: The "Share
Pack" modal appears (code14.html). System Action: A secure, read-only
link is pre-generated. User Action: Sarah can simply copy the link, or
she can enter the email of the buyer's solicitor directly into the modal
to send it. She can also set an expiry date for the link.

The Solicitor's Experience: User Action (Solicitor): The buyer's
solicitor receives the link. UI: They are taken to a read-only,
professional view of the Information Pack (code15.html style). They can
see the AI summary, the risk assessment, and can view each document with
the AI highlights, but they cannot edit anything.

Outcome: The solicitor gets a massive head-start on their due diligence.
The sale is accelerated, and the fall-through risk is reduced. Sarah has
successfully done her job.
