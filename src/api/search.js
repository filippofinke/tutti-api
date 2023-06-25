const utils = require(__dirname + "/../utils");

/** @module search */

const search = {
  _offset: 0,
  _first: 30,
  _sort: "TIMESTAMP",
  _direction: "DESCENDING",
  _category: null,
  _intervals: null,
  _locations: null,
  _prices: null,
  _strings: null,

  price(min = null, max = null, freeOnly = false) {
    if (!this._prices) this._prices = [];

    this._prices.push({
      min: min,
      max: max,
      freeOnly: freeOnly,
    });

    return this;
  },

  location(localities, radius = 0) {
    if (!this._locations) this._locations = [];

    if (!Array.isArray(localities)) localities = [localities];

    this._locations.push({
      key: "location",
      radius: radius,
      localities: localities,
    });

    return this;
  },

  organic(value = "tutti") {
    if (!this._strings) this._strings = [];

    this._strings.push({
      key: "organic",
      value: [value],
    });

    return this;
  },

  companyAd(value = "private") {
    if (!this._strings) this._strings = [];

    this._strings.push({
      key: "companyAd",
      value: [value],
    });

    return this;
  },

  languages(value) {
    if (!this._strings) this._strings = [];

    if (!Array.isArray(value)) value = [value];

    this._strings.push({
      key: "languages",
      value: value,
    });

    return this;
  },

  category(category = null) {
    this._category = category;
    return this;
  },

  first(first = 30) {
    this._first = first;
    return this;
  },

  offset(offset = 0) {
    this._offset = offset;
    return this;
  },

  sort(sort = "TIMESTAMP", direction = "DESCENDING") {
    this._sort = sort;
    this._direction = direction;
    return this;
  },

  async find(query = null) {
    let body = {
      query: `query SearchListingsByConstraints($query: String, $constraints: ListingSearchConstraints, $category: ID, $first: Int!, $offset: Int!, $sort: ListingSortMode!, $direction: SortDirection!) {\n  searchListingsByQuery(\n    query: $query\n    constraints: $constraints\n    category: $category\n  ) {\n    ...searchResultFields\n  }\n}\n\nfragment searchResultFields on ListingSearchResult {\n  listings(first: $first, offset: $offset, sort: $sort, direction: $direction) {\n    ...listingsConnectionFields\n  }\n  galleryListings(first: 3) {\n    ...listingFields\n  }\n  filters {\n    ...filterFields\n  }\n  suggestedCategories {\n    ...suggestedCategoryFields\n  }\n  selectedCategory {\n    ...selectedCategoryFields\n  }\n  seoInformation {\n    seoIndexable\n    deQuerySlug: querySlug(language: DE)\n    frQuerySlug: querySlug(language: FR)\n    itQuerySlug: querySlug(language: IT)\n    bottomSEOLinks {\n      label\n      slug\n      searchToken\n    }\n  }\n  searchToken\n  query\n}\n\nfragment selectedCategoryFields on Category {\n  categoryID\n  label\n  ...categoryParentFields\n}\n\nfragment categoryParentFields on Category {\n  parent {\n    categoryID\n    label\n    parent {\n      categoryID\n      label\n      parent {\n        categoryID\n        label\n      }\n    }\n  }\n}\n\nfragment suggestedCategoryFields on Category {\n  categoryID\n  label\n  searchToken\n  mainImage {\n    rendition(width: 300) {\n      src\n    }\n  }\n}\n\nfragment filterFields on ListingFilter {\n  __typename\n  ...filterDescriptionFields\n  ... on ListingIntervalFilter {\n    ...intervalFilterFields\n  }\n  ... on ListingSingleSelectFilter {\n    ...singleSelectFilterFields\n  }\n  ... on ListingMultiSelectFilter {\n    ...multiSelectFilterFields\n  }\n  ... on ListingPricingFilter {\n    ...pricingFilterFields\n  }\n  ... on ListingLocationFilter {\n    ...locationFilterFields\n  }\n}\n\nfragment filterDescriptionFields on ListingsFilterDescription {\n  name\n  label\n  disabled\n}\n\nfragment intervalFilterFields on ListingIntervalFilter {\n  ...filterDescriptionFields\n  intervalType {\n    __typename\n    ... on ListingIntervalTypeText {\n      ...intervalTypeTextFields\n    }\n    ... on ListingIntervalTypeSlider {\n      ...intervalTypeSliderFields\n    }\n  }\n  intervalValue: value {\n    min\n    max\n  }\n  step\n  unit\n  minField {\n    placeholder\n  }\n  maxField {\n    placeholder\n  }\n}\n\nfragment intervalTypeTextFields on ListingIntervalTypeText {\n  minLimit\n  maxLimit\n}\n\nfragment intervalTypeSliderFields on ListingIntervalTypeSlider {\n  sliderStart: minLimit\n  sliderEnd: maxLimit\n}\n\nfragment singleSelectFilterFields on ListingSingleSelectFilter {\n  ...filterDescriptionFields\n  ...selectFilterFields\n  selectedOption: value\n}\n\nfragment selectFilterFields on ListingSelectFilter {\n  options {\n    ...selectOptionFields\n  }\n  placeholder\n  inline\n}\n\nfragment selectOptionFields on ListingSelectOption {\n  value\n  label\n}\n\nfragment multiSelectFilterFields on ListingMultiSelectFilter {\n  ...filterDescriptionFields\n  ...selectFilterFields\n  selectedOptions: values\n}\n\nfragment pricingFilterFields on ListingPricingFilter {\n  ...filterDescriptionFields\n  pricingValue: value {\n    min\n    max\n    freeOnly\n  }\n  minField {\n    placeholder\n  }\n  maxField {\n    placeholder\n  }\n}\n\nfragment locationFilterFields on ListingLocationFilter {\n  ...filterDescriptionFields\n  value {\n    radius\n    selectedLocalities {\n      ...localityFields\n    }\n  }\n}\n\nfragment localityFields on Locality {\n  localityID\n  name\n  localityType\n}\n\nfragment listingFields on Listing {\n  listingID\n  title\n  body\n  postcodeInformation {\n    postcode\n    locationName\n    canton {\n      shortName\n      name\n    }\n  }\n  timestamp\n  formattedPrice\n  formattedSource\n  highlighted\n  primaryCategory {\n    categoryID\n  }\n  sellerInfo {\n    alias\n    logo {\n      rendition {\n        src\n      }\n    }\n    subscriptionInfo {\n      subscriptionBadge {\n        src(format: SVG)\n      }\n    }\n  }\n  images(first: 15) {\n    __typename\n  }\n  thumbnail {\n    normalRendition: rendition(width: 235, height: 167) {\n      src\n    }\n    retinaRendition: rendition(width: 470, height: 334) {\n      src\n    }\n  }\n  seoInformation {\n    deSlug: slug(language: DE)\n    frSlug: slug(language: FR)\n    itSlug: slug(language: IT)\n  }\n}\n\nfragment listingsConnectionFields on ListingsConnection {\n  totalCount\n  edges {\n    node {\n      ...listingFields\n    }\n  }\n  placements {\n    keyValues {\n      key\n      value\n    }\n    pageName\n    pagePath\n    positions {\n      adUnitID\n      mobile\n      position\n      positionType\n    }\n    afs {\n      customChannelID\n      styleID\n      adUnits {\n        adUnitID\n        mobile\n      }\n    }\n  }\n}`,
      variables: {
        query: query,
        constraints: {
          intervals: this._intervals,
          locations: this._locations,
          prices: this._prices,
          strings: this._strings,
        },
        category: this._category,
        status: "pendingUpdateWithoutToken",
        first: this._first,
        offset: this._offset,
        direction: this._direction,
        sort: this._sort,
      },
    };
    let response = await utils.request(`graphql`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.data.searchListingsByQuery.listings;
  },
};

module.exports = {
  search,
};
