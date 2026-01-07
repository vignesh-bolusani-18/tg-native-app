// useExperiment.js
import { useSelector, useDispatch } from "react-redux";

import { loadExperimentList } from "../redux/actions/experimentActions";

const useExperimentAuxillary = () => {
  const dispatch = useDispatch();

  const loadExperiementsList = (userInfo) => {
    dispatch(loadExperimentList(userInfo));
  };
  const experiments_list = useSelector(
    (state) => state.experiment.experiments_list
  );
  const experiment_config = useSelector(
    (state) => state.experiment.experiment_config
  );

  const needToJoin = useSelector((state) => state.experiment.needToJoin);
  const joinsAdded = useSelector((state) => state.experiment.joinsAdded);
  const datasetsAdded = useSelector((state) => state.experiment.datasetsAdded);

  return {
    loadExperiementsList,
    experiments_list,
    needToJoin,
    joinsAdded,
    experiment_config,
    datasetsAdded
  };
};

export default useExperimentAuxillary;
