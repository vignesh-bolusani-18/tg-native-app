const stepsInfo = {
  supply_chain_manager_workflow: {
    module_decider: 1,
    data_demander: 2,
    tags_generator: 3,
    context_questions_generator: 4,
    advanced_questions_generator: 5,
    experiment_validator: 6,
  },
  auto_ml_workflow: {
    module_decider: 1,
    data_demander: 2,
    tags_generator: 3,
    context_questions_generator: 4,
    advanced_questions_generator: 5,
    experiment_validator: 6,
  },
};

const no_of_steps = {
  supply_chain_manager_workflow: 6,
  auto_ml_workflow: 6,
};

// User-friendly names for each step
const stepNames = {
  supply_chain_manager_workflow: {
    module_decider: "Selecting Module",
    data_demander: "Data Collection",
    tags_generator: "Data Configuration",
    context_questions_generator: "Context Questions",
    advanced_questions_generator: "Advanced Settings",
    experiment_validator: "Validation & Launch",
  },
  auto_ml_workflow: {
    module_decider: "Selecting Module",
    data_demander: "Data Collection",
    tags_generator: "Data Configuration",
    context_questions_generator: "Context Questions",
    advanced_questions_generator: "Advanced Settings",
    experiment_validator: "Validation & Launch",
  },
};

export { stepsInfo, no_of_steps, stepNames };
