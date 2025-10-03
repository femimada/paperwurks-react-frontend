graph TD
subgraph Legend
direction LR
U(User Action)
S(System Action)
UI(UI / Page View)
E(External Action / Email)
end

    %% Styles
    classDef userAction fill:#eef6fe,stroke:#1d4ed8,stroke-width:2px;
    classDef systemAction fill:#fef9c3,stroke:#ca8a04,stroke-width:1px,stroke-dasharray: 5 5;
    classDef uiView fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    classDef externalAction fill:#fce7f3,stroke:#db2777,stroke-width:2px;

    class U,S,UI,E userAction

    subgraph "ACTOR: Estate Agent (Initiator)"
        A1(U: Registers & Logs In) --> A2(UI: Agent Dashboard - List of Property Files)
        A2 --> A3(U: Clicks 'New Property File')
        A3 --> A4(UI: Lean 'Quick-Start' Form)
        A4 --> A5(U: Fills Address, Ref, Tenure)
        A5 --> A6(S: Creates Property File in DB)

        A6 --> A7(UI: Property File Dashboard - Docs Tab)
        A7 --> A8(U: Clicks 'Invite Seller to Upload Documents')
        A8 --> A9(UI: 'Invite Seller' Modal)
        A9 --> A10(U: Enters Property Seller's Email)
        A10 --> B1(E: System sends secure upload link to Seller)

        B5 --> A11(S: Documents Appear in Agent's Dashboard)
        A11 --> A12(UI: Document Status is 'Awaiting Review')
        A12 --> A13(U: Clicks 'Invite Solicitor')
        A13 --> A14(UI: 'Invite Solicitor' Modal)
        A14 --> A15(U: Enters Solicitor's Email & assigns the case)
        A15 --> C1(E: System invites Solicitor to the Property File)

        A15 --> A16(U: Can now track the Solicitor's progress in real-time)
        A16 --> A17(UI: Agent Dashboard shows status like 'Under Legal Review')
    end

    subgraph "ACTOR: Property Seller (Collaborator)"
        B1 --> B2(U: Clicks link, Registers & Logs In)
        B2 --> B3(UI: Simple Owner Dashboard - 'To-Do List' View)
        B3 --> B4(U: Uploads required documents)
        B4 --> B5(S: Files are uploaded & linked to case)

        B5 --> B6(U: Can now track the Solicitor's progress via a Timeline View)
        B6 --> B7(U: Can see key status updates for transparency)
    end

    subgraph "ACTOR: Solicitor (Power User)"
        C1 --> C2(U: Clicks invite, Registers & Logs In)
        C2 --> C3(UI: Solicitor Dashboard - List of Assigned Cases)
        C3 --> C4(U: Opens the new case from the Agent)
        C4 --> C5(UI: Case File Dashboard - Documents are already there)

        C5 --> C6(S: AI Analysis is Triggered)
        C6 --> C7(S: 'Analysis Complete' Notification)
        C7 --> C8(U: Clicks 'Review Documents')
        C8 --> C9(UI: Document Viewer with AI Highlights & Comments)
        C9 --> C10(U: Adds formal comments, requests more docs, & signs-off)

        C10 --> C11(U: Clicks 'Finalize & Share Report')
        C11 --> C12(S: Generates Secure Read-Only Link)
        C12 --> D1(E: Link is sent to Buyer's Legal Team)
    end

    subgraph "ACTOR: Buyer's Team (Recipient)"
        D1 --> D2(U: Clicks secure link in email)
        D2 --> D3(UI: Read-only, professional Information Pack View)
    end
