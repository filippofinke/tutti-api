const utils = require(__dirname + "/../utils");

const type = {
  all: null,
  offer: "s",
  request: "k",
};

const order_by = {
  most_relevant: 3,
  highest_price: 2,
  lowest_price: 1,
  oldest: 0,
  newest: null,
};

const canton = {
  aargau: 1,
  appenzell: 2,
  basel: 3,
  bern: 4,
  fribourg: 5,
  geneva: 6,
  glarus: 7,
  grisons: 8,
  jura: 9,
  lucerne: 10,
  neuchatel: 11,
  "nid- & obwalden": 12,
  schaffhausen: 13,
  schwyz: 14,
  solothurn: 15,
  "st gallen": 16,
  thurgau: 17,
  ticino: 18,
  uri: 19,
  vaud: 20,
  valais: 21,
  zug: 22,
  zurich: 23,
  liechtenstein: 24,
};

const search = {
  _page: 1,
  _aggregated: 1,
  _limit: 30,
  _region: "",
  _with_all_regions: false,
  _st: null,
  _organic: null,
  _ps: null,
  _pe: null,
  _sp: null,
  _with_neighbouring_regions: null,
  _zipcode: null,
  _radius: null,
  _category: null,
  _subcategory: null,

  page(page) {
    this._page = page;
    return this;
  },

  aggregated(aggregated) {
    this._aggregated = aggregated;
    return this;
  },

  limit(limit) {
    this._limit = limit;
    return this;
  },

  canton(canton) {
    this._region = canton;
    return this;
  },

  withAllRegions(with_all_regions) {
    this._with_all_regions = with_all_regions;
    return this;
  },

  withNeighbouringRegions(with_neighbouring_regions) {
    this._with_neighbouring_regions = with_neighbouring_regions;
    return this;
  },

  withZipCode(zipcode) {
    this._zipcode = zipcode;
    return this;
  },

  withZipCodeAndWithinRadius(zipcode, radius) {
    this._zipcode = zipcode;
    this._radius = radius;
    return this;
  },

  category(category) {
    this._category = category;
    return this;
  },

  subcategory(subcategory) {
    this._subcategory = subcategory;
    return this;
  },

  type(type) {
    this._st = type;
    return this;
  },

  organic(organic) {
    this._organic = organic;
    return this;
  },

  minPrice(price_min) {
    this._ps = price_min;
    return this;
  },

  maxPrice(price_max) {
    this._pe = price_max;
    return this;
  },

  orderBy(order_by) {
    this._sp = order_by;
    return this;
  },

  find(query = null) {
    const params = new URLSearchParams();

    let path = `list.json?`;
    for (let prop of Object.getOwnPropertyNames(search).filter(
      (prop) => prop.startsWith("_") && search[prop] != null
    )) {
      params.append(prop.substr(1), this[prop]);
    }
    if (query) {
      params.append("q", query);
    }
    console.log(path + params);
    return utils.request(path + params);
  },
};

let props = {};
Object.getOwnPropertyNames(search).forEach((prop) => {
  if (prop.startsWith("_")) {
    let obj = {};
    obj[prop] = {
      enumerable: false,
    };
    props = {
      ...obj,
      ...props,
    };
  }
});
Object.defineProperties(search, props);

exports.search = search;
exports.type = type;
exports.order_by = order_by;
exports.canton = canton;
