[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/cqMWIy-z)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=18992143&assignment_repo_type=AssignmentRepo)

graph TD
    %% Nodes
    A[Frontend]:::frontend
    A1[src]:::frontend
    A2[components]:::frontend
    A3[App.js]:::frontend

    B[Backend]:::backend
    B1[Controllers]:::backend
    B2[Models]:::backend
    B3[Services]:::backend

    C[Linter]:::linter
    C1[Rules]:::linter
    C2[Parser]:::linter

    %% Connections
    A --> A1
    A1 --> A2
    A2 --> A3

    B --> B1
    B --> B2
    B --> B3

    C --> C1
    C --> C2

%% Color definitions
classDef frontend fill:#FFF9C4,stroke:#333,stroke-width:1px;
classDef backend fill:#FFCDD2,stroke:#333,stroke-width:1px;
classDef linter fill:#C8E6C9,stroke:#333,stroke-width:1px;
