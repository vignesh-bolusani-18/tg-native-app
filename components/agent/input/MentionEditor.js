// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\input\MentionEditor.js
import React, { useState } from "react";
import {
    FlatList,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const MentionEditor = ({
  value,
  onChange,
  onSend,
  placeholder,
  editable,
  suggestions = [],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Handle text change and detect @mentions
  const handleChangeText = (text) => {
    onChange(text);

    // Detect @ symbol near cursor
    const lastAt = text.lastIndexOf("@");
    if (lastAt !== -1 && lastAt < text.length) {
      const query = text.substring(lastAt + 1);
      // Only show suggestions if query doesn't contain spaces (simple logic)
      if (!query.includes(" ")) {
        const filtered = suggestions.filter(s => 
          s.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion) => {
    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1) {
      const newValue = value.substring(0, lastAt) + `@${suggestion.name} ` + value.substring(lastAt + value.length); // Append with space
      onChange(newValue);
      setShowSuggestions(false);
    }
  };

  return (
    <View className="relative w-full">
      {/* Suggestions Popup (Absolute positioned above input) */}
      {showSuggestions && (
        <View 
          className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mb-2"
          style={{ maxHeight: 150, zIndex: 1000 }}
        >
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="p-3 border-b border-gray-100 flex-row items-center"
                onPress={() => handleSelectSuggestion(item)}
              >
                <View className="w-6 h-6 rounded bg-blue-100 items-center justify-center mr-2">
                  <Text className="text-blue-600 font-bold text-xs">@</Text>
                </View>
                <Text className="text-gray-800 text-sm font-medium">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Text Input */}
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        editable={editable}
        multiline
        className="text-gray-800 text-base leading-5 pt-2 pb-2"
        style={{ 
          minHeight: 40, 
          maxHeight: 120,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' 
        }}
      />
    </View>
  );
};

export default MentionEditor;