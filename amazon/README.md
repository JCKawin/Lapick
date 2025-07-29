
# Amazon Scraper & Search API

This Express.js server provides an API for scraping Amazon product pages and interacting with Amazon's search and filter functionality.

## Running the Server

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Server:**
   ```bash
   node index.js
   ```
   The server will start on `http://localhost:3001`.

## API Documentation

### Product Scraping

#### `POST /api/scrape/product`

Scrapes a single Amazon product page for details.

**Request Body:**

```json
{
  "url": "<AMAZON_PRODUCT_URL>"
}
```

**Response:**

- **200 OK:**
  ```json
  {
    "success": true,
    "data": {
      "price": "...",
      "images": [{"src": "...", "alt": "..."}],
      "details": [{"key": "...", "value": "..."}]
    }
  }
  ```
- **400 Bad Request:** If the `url` is missing.
- **500 Internal Server Error:** If scraping fails.

---

### Search & Filtering

These endpoints manage a persistent Puppeteer browser instance for searching and applying filters.

#### `POST /api/search/initialize`

Initializes a browser instance and navigates to the Amazon search results page for the given query.

**Request Body:**

```json
{
  "searchQuery": "<YOUR_SEARCH_QUERY>"
}
```

**Response:**

- **200 OK:** `{ "success": true, "message": "..." }`
- **500 Internal Server Error:** If initialization fails.

#### `GET /api/search/filters`

Scrapes the current page for all available filter options.

**Response:**

- **200 OK:**
  ```json
  {
    "success": true,
    "filters": [
      {
        "divId": "...",
        "categoryName": "...",
        "optionCount": 0,
        "options": [
          {
            "index": 0,
            "text": "...",
            "liId": "...",
            "linkHref": "...",
            "isChecked": false,
            "primarySelector": "..."
          }
        ]
      }
    ]
  }
  ```
- **500 Internal Server Error:** If scraping fails.

#### `POST /api/search/click-filter`

Clicks a specific filter option based on its `divId` and the option's index.

**Request Body:**

```json
{
  "filterId": "<FILTER_DIV_ID>",
  "optionIndex": <OPTION_INDEX>
}
```

**Response:**

- **200 OK:** Returns the updated list of filters after the click.
- **500 Internal Server Error:** If clicking the filter fails.

#### `POST /api/search/close`

Closes the browser instance used for searching.

**Response:**

- **200 OK:** `{ "success": true, "message": "..." }`

## Running the Tests

To verify that the API is working correctly, run the test script:

1. **Make sure the server is running in a separate terminal.**

2. **Run the test script:**
   ```bash
   node test.js
   ```

The script will call each endpoint and log the results to the console.
