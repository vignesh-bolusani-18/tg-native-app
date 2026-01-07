export const Supply_Plan_Info = {
  "Supply Plan": {
    Description:
      "Supply Plan dataset describing inventory, forecast, replenishment, production, and stock movement metrics across time steps.",
    "Important Column Info": {
      "Minimum Order Quantity":
        "Minimum quantity that must be ordered from the manufacturer for the given planning granularity.",

      lead_time:
        "Manufacturing lead time in days between placing an order and receiving goods from the manufacturer.",

      lead_time_reorder:
        "Reorder interval defining how frequently purchase orders (POs) are raised to the manufacturer.",

      stock_transfer_lead_time:
        "Lead time in days for transferring stock from an intermediate node or fulfiller.",

      current_week_sales_tilldate:
        "Total sales recorded for the current week up to the current date.",

      current_month_sales_tilldate:
        "Total sales recorded for the current month up to the current date.",

      Variable: {
        "Beginning Inventory":
          "Inventory available at the start of the time step before demand fulfillment and receipts.",
        "Days On Inventory":
          "Number of days the on-hand inventory can support based on forecasted daily demand.",
        "Days On Inventory With Pending":
          "Number of days the combined on-hand and in-transit inventory can support based on forecasted daily demand.",
        "End Inventory":
          "Inventory remaining after fulfilling forecasted demand for the time step.",
        Forecast: "Demand forecast generated for the specific time step.",
        "Forecast Per Day":
          "Average daily forecasted demand used for reorder and inventory coverage calculations.",
        "In Transit":
          "Quantity of inventory currently in transit and expected to arrive in the given time step.",
        "Production Plan":
          "Quantity planned to be produced or manufactured during the time step.",
        "Reorder Received":
          "Quantity received from previously placed replenishment orders during the time step.",
        "Safety Stock Days":
          "Number of days of additional inventory maintained as a buffer against demand and supply variability.",
        "Total Stock Transfer":
          "Total quantity of stock transferred between nodes during the time step.",
      },

      Date: "Time step represented as a date (e.g., 2025-10-11) for which all metrics are calculated.",
    },
  },
};
