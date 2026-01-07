export const Stock_Transfer_Info = {
  "Stock Transfer": {
    Description:
      "Gives the amount of Stocks to be transfered to prevent/minimize Potential Sales Loss and reduce the reorder quantity for first time step.",
    "Important Column Info": {
      "Component SKU": "Most granular item code for eacha SKU",
      Warehouse: "Warehouse code",
      From_Facility:
        "Warehouse code from which the Stock Transfer will be done to the Warehouse of current row",
      sales_loss_stock_transfer:
        "Stock Transfer quantity to prevent/minimize Potential Sales Loss",
      reorder_stock_transfer:
        "Stock Transfer quantity to reduce the reorder quantity",
      total_stock_transfer:
        "Total of salesloss_stock_transfer and reorder_stock_transfer",
    },
  },
};
