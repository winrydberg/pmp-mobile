import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { Divider} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';

const FAQScreen = () => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setExpandedItems({
      ...expandedItems,
      [index]: !expandedItems[index],
    });
  };

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by going to the Password & Security section in your account settings and following the prompts.',
    },
    {
      question: 'How can I update my personal information?',
      answer: 'Navigate to the Personal Information section in settings where you can edit and save your details.',
    },
    {
      question: 'Why am I not receiving notifications?',
      answer: 'Check your notification preferences in settings to ensure you have enabled the types of notifications you want to receive.',
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach our support team through the Help Center section in the app or by emailing support@example.com.',
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption to protect all your payment information and transactions.',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <List.Accordion
            title={faq.question}
            isExpanded={expandedItems[index]}
            onPress={() => toggleItem(index)}
            containerStyle={styles.accordionContainer}
            titleStyle={styles.questionText}
            icon={
              <Feather
                name={expandedItems[index] ? 'chevron-up' : 'chevron-down'}
                size={20}
              />
            }>
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>{faq.answer}</Text>
            </View>
          </List.Accordion>
          <Divider />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  faqItem: {
    marginBottom: 10,
  },
  accordionContainer: {
    backgroundColor: 'white',
    padding: 0,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  answerContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 5,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default FAQScreen;