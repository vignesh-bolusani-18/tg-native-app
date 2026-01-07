export const DOI_Details_Info = {
  "DOI Details": {
    Description:
      "Supply Plan dataset describing inventory, forecast, replenishment, production, and stock movement metrics across time steps.",
    "Important Column Info": {
      "Component SKU": "Most granular item code for eacha SKU",
      Warehouse: "Warehouse code",
      cluster: "",
      total_demand: "total demand for entire forecasting period",
      "Sales Per Day": "",
      Forecast_Per_Day:
        "Moving forecast per day calculated by going ahead LT+ST days ahead",
      Stock_On_Hand: "Current stock on hand, also called Beginning Inventory",
      DOI_Current_Stock:
        "How many days the Stock_On_Hand will last, Its equal to the Forecast value for these many days, from today.",
      Current_OOS_Date:
        "When will the current Stock_On_Hand will be over. Calculated as current date + DOI_Current_Stock",
      "In Transit": "Amount of Purchase Orders that are in transit.",
      "Days on Inventory": "Same as DOI_Current_Stock",
      "TG Safety Stock":
        "The Safety Stock quantity that should be maintained at each time step.",
      "Minimum Order Quantity":
        "The minimum quantity that shall be ordered from manufacturer considering Supply constraints.",
      round_off_reorder: "",
      "TG Reorder Quantity": "",
      "TG Reorder Date":
        "The date when the reorder should be placed to the manufacturer",
      "TG Reorder now":
        "The amount of reorder that should be placed to the manufacturer",
      "Fulfillment Node": "",
      Stock_Risk_Level:
        "Is the current Stock_On_Hand sufficient to fulfill Forecast till lead time no.of days plus safety stock",
      Excess_Stock:
        "How much excess stock is there after subtracting Forecast for Lead time no.of days and Safety Stock.",
      "TG Safety Stock Days": "",
      lead_time:
        "Time in days taken for the orders to reach from manufacturer to Warehosue.",
      lead_time_reorder:
        "This is the frequency (no.of days) at which the orders are places to the manufacturer.",
      stock_transfer_lead_time:
        "This is the no.of days it takes to transfer stocks from one warehosue to another, ",
      Potential_Sales_Loss:
        "Forecast till Lead Time no.of days - Total Stock in Hand including stocks In Transit",
      Final_Potential_Sales_Loss:
        "Potential_Sales_Loss minus the stocks tranfered from warehouses",
      raw_loss: "Same as Potential Sales Loss",
      gap_loss:
        "The Forecast from the date of stockout till the stock_transfer_lead_time days",
      non_gap_loss_before_transfer: "Potential Sales Loss minus gap loss",
      non_gap_loss_after_transfer:
        "Potential Sales Loss minus gap loss minus Stocks transferred",
      transfer_used_for_loss:
        "total stocks transferred from warehouses to prevent/minimise Potential Sales loss",
      stock_transfer_dict:
        "A dictionary where key is the warehouse code from where Stocks need to be transferred, and value is the amount of stocks that need to be transferred, in order to prevent/minimize sales loss.",
      updated_Excess_Stock:
        "Stock on Hand minus Stocks transferred to prevent Sales Loss and Reorder",
      updated_Potential_Sales_Loss:
        "Potential Sales Loss minus Stocks Transferred",
      stock_transfer_po:
        "total stocks transferred from warehouses to prevent/minimise Potential Sales loss",
      reorder_transfer_dict:
        "A dictionary where key is the warehouse code from where Stocks need to be transferred, and value is the amount of stocks that need to be transferred, in order to reduce the amount of stcok that will be reordered from manufacturer..",
      updated_TG_Reorder_now: "",
      Unit_price: "Price of each item ",
      soh_value: "",
      Excess_Stock_value: "",
      ts_id: "A key, created by concatenating granularity columns",
      "Current Month Sales till Date": "Total sales till Month Till date",
      sales_last7days: "Total sales in last 7 days",
      sales_last30days: "Total sales in last 30 days",
      "Open PO": "",
      "TG Ideal Inventory": "",
      "TG Reorder Point": "",
      current_safety_stock: "",
      "TG Reorder Interval":
        "This is the frequency (no.of days) at which the orders are places to the manufacturer.",
      "TG Ideal Inventory Days": "",
      Dead_Stock: "",
      Potential_Sales_Loss_value: "",
      Reorder_now_value: "",
      potential_stock_wastage: "",
      potential_stock_wastage_value: "",
      product_category_marketing: "",
      Global_Product_Title: "",
      SKU_Status:
        "Status of the SKU, for example Active, Discontinued, Phased Out etc",
      product_category_matheo: "product category matheo",
      Product_Sub_Category: "Product SubCategory",
      Product_type: "Product_type",
      Lifestage: "",
      sales_deviation_by_day: "",
      age_days: "",
      "Age Months": "",
      current_week_sales_tilldate: "Total sales for week Till date",
      current_year_sales_tilldate: "Total sales for  Year Till date",
      current_fiscal_year_sales_tilldate: "",
      sales_last60days: "Total sales in last 60 days",
      sales_last90days: "Total sales in last 90 days",
      Sales_Per_Day_2_M: "",
      Return_Per_Day: "",
      "%Return": "",
      Stock_Type: "",
      COGS: "Cost of goods",
      Dead_Stock_value: "",
      "Margin%": "",
    },
  },
};
