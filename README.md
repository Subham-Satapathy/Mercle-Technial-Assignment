
## MERCLE Assignment Project

This project provides various utilities and services for managing and interacting with blockchain-based processes, focusing on efficient route calculations, bridge fees, and user balance fetching.



## Installation

Install my-project with npm

Clone the repository:
```bash
  git clone <repository_url>

```
Navigate to the project directory:
```bash
  cd MERCLE

```
Install dependencies:
```bash
  bun install

```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

You can use below API KEY provided by socket-api or request a new one from them.

`72a5b4b0-e727-48be-8aa1-5da9d62fe635`



## Run Locally

Build
```bash
  bun run build
```

Run the application:

```bash
  bun run start
```
OR

```bash
  bun dev
```


## API Reference

#### Fetches the most cost-efficient bridge path for asset transfers.

```http
  GET /fetch-efficient-bridge-path
```

| Parameter | Type     | Required/Optional                |
| :-------- | :------- | :------------------------- |
| `targetChain` | `string` | **Required**. 
| `amount` | `string` | **Required**.
| `tokenSymbol` | `string` | **Required**.
| `userAddress` | `string` | **Required**.
| `fastestRoute` | `string` | Optional.


