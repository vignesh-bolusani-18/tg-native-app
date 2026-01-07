import { all } from "axios";
import { allTags } from "./allTags";

const ts_data_optionals = [
  allTags.driver_columns,
  allTags.optimization_column,
  allTags.dimensions,
  allTags.return_qty_column,
];

export const tagFieldConfigs = {
  sales: {
    mandatory_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.target_column,
      allTags.ts_id_columns,
    ],
    optional_tags: ts_data_optionals,
  },
  inventory: {
    mandatory_tags: [allTags.ts_id_columns, allTags.inventory_column],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.replenishment_columns,
      allTags.batch_column,
      allTags.intransit,
    ],
  },
  pricing: {
    mandatory_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
    ],
    optional_tags: ts_data_optionals.slice(1),
  },
  store: {
    mandatory_tags: [
      allTags.store_number,
      allTags.floor,
      allTags.mod,
      allTags.h_shelf,
      allTags.v_shelf,
      allTags.store__category,
      allTags.store__dimensions__width,
      allTags.store__dimensions__height,
      allTags.store__dimensions__depth,
      allTags.store__facing_constraint__max,
    ],
    optional_tags: [allTags.store__facing_constraint__min],
  },
  product: {
    mandatory_tags: [
      allTags.product_id,
      allTags.product__category,
      allTags.product__brand,
      allTags.selling_price,
      allTags.margin,
      allTags.product__dimensions__width,
      allTags.product__dimensions__height,
      allTags.product__dimensions__depth,
      allTags.product__facing_constraint__max,
    ],
    optional_tags: [
      allTags.cost_price,
      allTags.product__facing_constraint__min,
    ],
  },
  images: {
    mandatory_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.target_column,
      allTags.id_column,
    ],
    optional_tags: [allTags.regressor_columns],
  },
  others: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },
  inventoryothers: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },
  new_product: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },

  simple_disaggregation_mapping: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },
  future: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },
  item_master: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.supply_item_master,
      allTags.intransit,
    ],
  },
  future: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.supply_item_master,
      allTags.intransit,
    ],
  },
  bom_mapping: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },
  bom_inventory: {
    mandatory_tags: [allTags.ts_id_columns, allTags.inventory_column_bom],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.replenishment_columns,
      allTags.batch_column,
      allTags.intransit,
    ],
  },
  bomothers: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.driver_columns,
      allTags.dimensions,
      allTags.replenishment_columns,
      allTags.return_qty_column,
      allTags.intransit,
    ],
  },
  forecast: {
    mandatory_tags: [allTags.ts_id_columns],
    optional_tags: [
      allTags.date_format,
      allTags.timestamp_column,
      allTags.tg_forecast,
      allTags.sales_forecast,
      allTags.marketing_forecast,
      allTags.ops_forecast,
      allTags.consensus_forecast,
      allTags.comments,
    ],
  },
  rewrite_forecast: {
    mandatory_tags: [
      allTags.ts_id_columns,
      allTags.target_column,
      allTags.date_format,
      allTags.timestamp_column,
    ],
    optional_tags: [],
  },
  transition_item: {
    mandatory_tags: [
      allTags.transition_data_old_item_column,
      allTags.transition_data_new_item_column,
      allTags.sales_data_item_column,
    ],
    optional_tags: [],
  },
};
