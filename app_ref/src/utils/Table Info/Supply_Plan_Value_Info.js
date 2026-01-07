export const Supply_Plan_Value_Info = {
  "Supply Plan Value": {
    Description:
      "Supply Plan Value dataset describing inventory, forecast, replenishment, production, and stock movement metrics across time steps, where all values represent monetary amounts (not units).",
    "Important Column Info": {
      "Minimum Order Quantity":
        "Minimum order quantity in monetary value (e.g., total cost) that must be ordered from the manufacturer for the given planning granularity.",

      lead_time:
        "Manufacturing lead time in days between placing an order and receiving goods from the manufacturer (monetary impact reflected accordingly).",

      lead_time_reorder:
        "Reorder interval defining how frequently purchase orders (POs) are raised to the manufacturer (all values in monetary terms).",

      stock_transfer_lead_time:
        "Lead time in days for transferring stock from an intermediate node or fulfiller, affecting monetary stock values.",

      current_week_sales_tilldate:
        "Total sales value (in monetary terms) recorded for the current week up to the current date.",

      current_month_sales_tilldate:
        "Total sales value (in monetary terms) recorded for the current month up to the current date.",

      Variable: {
        "Beginning Inventory":
          "Monetary value of inventory available at the start of the time step before demand fulfillment and receipts.",
        "Days On Inventory":
          "Number of days the on-hand inventory (in monetary value) can support based on forecasted daily demand value.",
        "Days On Inventory With Pending":
          "Number of days the combined on-hand and in-transit inventory (in monetary value) can support based on forecasted daily demand value.",
        "End Inventory":
          "Monetary value of inventory remaining after fulfilling forecasted demand for the time step.",
        Forecast:
          "Demand forecast (in monetary value) generated for the specific time step.",
        "Forecast Per Day":
          "Average daily forecasted demand value used for reorder and inventory coverage calculations.",
        "In Transit":
          "Monetary value of inventory currently in transit and expected to arrive in the given time step.",
        "Production Plan":
          "Planned value (in monetary terms) of production or manufacturing during the time step.",
        "Reorder Received":
          "Monetary value of inventory received from previously placed replenishment orders during the time step.",
        "Safety Stock Days":
          "Number of days of additional inventory (in value) maintained as a buffer against demand and supply variability.",
        "Total Stock Transfer":
          "Total value (in monetary terms) of stock transferred between nodes during the time step.",
      },

      Date: "Time step represented as a date (e.g., 2025-10-11) for which all monetary metrics are calculated.",
    },
  },
};
