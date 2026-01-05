import { StyleSheet, Text, View } from 'react-native';

const ExperimentExecutorSection = ({ messageId, langgraphState }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Experiment Executor Section Placeholder</Text>
      <Text style={styles.subText}>
        (Missing dependencies: MUI, CustomInputControls, useConfig, useModule)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ExperimentExecutorSection;
