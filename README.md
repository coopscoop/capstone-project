[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/cqMWIy-z)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=18992143&assignment_repo_type=AssignmentRepo)

%% Tree-style project structure with colors
graph TD
    Root[📁 Capstone Project]

    %% Frontend
    FE[📂 Frontend]:::frontend
    FE_SRC[📂 src]:::frontend
    FE_APP[📄 App.js]:::frontend
    FE_INDEX[📄 index.js]:::frontend

    %% Backend
    BE[📂 Backend]:::backend
    BE_CTRL[📂 Controllers]:::backend
    BE_MODEL[📂 Models]:::backend
    BE_SERV[📂 Services]:::backend

    %% Linter
    LINT[📂 Linter]:::linter
    L_RULES[📄 Rules.js]:::linter
    L_PARSER[📄 Parser.js]:::linter

    %% Connections
    Root --> FE
    FE --> FE_SRC
    FE_SRC --> FE_APP
    FE_SRC --> FE_INDEX

    Root --> BE
    BE --> BE_CTRL
    BE --> BE_MODEL
    BE --> BE_SERV

    Root --> LINT
    LINT --> L_RULES
    LINT --> L_PARSER

%% Color definitions
classDef frontend fill:#FFF9C4,stroke:#333,stroke-width:1px;
classDef backend fill:#FFCDD2,stroke:#333,stroke-width:1px;
classDef linter fill:#C8E6C9,stroke:#333,stroke-width:1px;

