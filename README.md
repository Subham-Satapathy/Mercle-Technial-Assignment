
## MERCLE Assignment Project

This project provides various utilities and services for managing and interacting with blockchain-based processes, focusing on efficient route calculations, bridge fees, and user balance fetching.



## Installation

Install my-project with npm

Clone the repository:
```bash
  git clone https://github.com/Subham-Satapathy/Mercle-Technial-Assignment.git

```
Navigate to the project directory:
```bash
  cd MERCLE

```
Install dependencies:
```bash
  bun install

```

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


## Running Tests

To run tests, run the following command

```bash
  bun test
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



## Status codes

| Code | Description||
:-------- | :------- | :------------------------- |
| `200` | Success |
| `400` | Bad Request |
| `500` | Internal Server Error |