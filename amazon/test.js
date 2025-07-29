

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const testProductUrl = 'https://www.amazon.in/ASUS-Vivobook-Windows-Backlit-E1504FA-LK321WS/dp/B0BTWCYPGV';
const testSearchQuery = 'gaming laptop';

const testEndpoints = async () => {
  try {
    console.log('--- Running API Tests ---\n');

    // 1. Test Product Scraper
    console.log(`[1/5] Testing Product Scraper for: ${testProductUrl}`);
    const scrapeResponse = await axios.post(`${API_BASE_URL}/scrape/product`, { url: testProductUrl });
    if (scrapeResponse.data.success && scrapeResponse.data.data) {
      console.log('✅ Product Scraper Test PASSED');
      console.log(`    - Found ${scrapeResponse.data.data.prices.length} prices.`);
      console.log(`    - Found ${scrapeResponse.data.data.images.length} images.`);
      console.log(`    - Found ${scrapeResponse.data.data.details.length} product details.`);
    } else {
      console.error('❌ Product Scraper Test FAILED', scrapeResponse.data.message);
    }
    console.log('\n' + '-'.repeat(30) + '\n');

    // 2. Test Search Initialization
    console.log(`[2/5] Testing Search Initialization with query: "${testSearchQuery}"`);
    const initResponse = await axios.post(`${API_BASE_URL}/search/initialize`, { searchQuery: testSearchQuery });
    if (initResponse.data.success) {
      console.log('✅ Search Initialization Test PASSED');
    } else {
      console.error('❌ Search Initialization Test FAILED', initResponse.data.message);
      return; // Stop if initialization fails
    }
    console.log('\n' + '-'.repeat(30) + '\n');

    // 3. Test Filter Scraping
    console.log('[3/5] Testing Filter Scraping...');
    const filtersResponse = await axios.get(`${API_BASE_URL}/search/filters`);
    if (filtersResponse.data.success && filtersResponse.data.filters.length > 0) {
      const firstFilter = filtersResponse.data.filters[0];
      console.log('✅ Filter Scraping Test PASSED');
      console.log(`    - Found ${filtersResponse.data.filters.length} filter categories.`);
      console.log(`    - First filter: "${firstFilter.categoryName}" with ${firstFilter.optionCount} options.`);

      // 4. Test Filter Clicking (click the first option of the first filter)
      if (firstFilter.options.length > 0) {
        const filterToClick = {
          filterId: firstFilter.divId,
          optionIndex: 0, // Click the first option
        };
        console.log(`\n[4/5] Testing Filter Clicking: "${firstFilter.categoryName} - ${firstFilter.options[0].text}"`);
        const clickResponse = await axios.post(`${API_BASE_URL}/search/click-filter`, filterToClick);
        if (clickResponse.data.success) {
          console.log('✅ Filter Clicking Test PASSED');
          console.log(`    - Successfully clicked filter. Server returned ${clickResponse.data.filters.length} updated filter categories.`);
        } else {
          console.error('❌ Filter Clicking Test FAILED', clickResponse.data.message);
        }
      }
    } else {
      console.error('❌ Filter Scraping Test FAILED', filtersResponse.data.message || 'No filters found.');
    }
    console.log('\n' + '-'.repeat(30) + '\n');

  } catch (error) {
    console.error(`\n🚨 An error occurred during testing: ${error.message}`);
    if (error.response) {
      console.error('    - Status:', error.response.status);
      console.error('    - Data:', error.response.data);
    }
  } finally {
    // 5. Close the search browser session
    console.log('[5/5] Closing search browser session...');
    try {
      const closeResponse = await axios.post(`${API_BASE_URL}/search/close`);
      if (closeResponse.data.success) {
        console.log('✅ Browser Session Closed Successfully.');
      } else {
        console.error('❌ Failed to close browser session.', closeResponse.data.message);
      }
    } catch (closeError) {
      console.error('🚨 Error closing browser session:', closeError.message);
    }
    console.log('\n--- Tests Finished ---');
  }
};

testEndpoints();

