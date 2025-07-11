import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface ParsedTextSegment {
  type: 'text' | 'mention' | 'hashtag';
  content: string;
  value?: string;
}

export interface TextParserOptions {
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (hashtag: string) => void;
  mentionColor?: string;
  hashtagColor?: string;
  textColor?: string;
}

export class TextParser {
  private static mentionRegex = /@(\w+)/g;
  private static hashtagRegex = /#(\w+)/g;

  // Parse text and extract mentions and hashtags
  static parseText(text: string): ParsedTextSegment[] {
    const segments: ParsedTextSegment[] = [];
    let lastIndex = 0;

    // Find all mentions and hashtags
    const matches: Array<{ type: 'mention' | 'hashtag'; match: RegExpExecArray; index: number }> = [];

    // Find mentions
    let mentionMatch;
    while ((mentionMatch = this.mentionRegex.exec(text)) !== null) {
      matches.push({
        type: 'mention',
        match: mentionMatch,
        index: mentionMatch.index,
      });
    }

    // Find hashtags
    let hashtagMatch;
    while ((hashtagMatch = this.hashtagRegex.exec(text)) !== null) {
      matches.push({
        type: 'hashtag',
        match: hashtagMatch,
        index: hashtagMatch.index,
      });
    }

    // Sort matches by position
    matches.sort((a, b) => a.index - b.index);

    // Build segments
    for (const match of matches) {
      // Add text before match
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add match
      segments.push({
        type: match.type,
        content: match.match[0],
        value: match.type === 'mention' ? match.match[1] : match.match[1],
      });

      lastIndex = match.index + match.match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return segments;
  }

  // Extract all mentions from text
  static extractMentions(text: string): string[] {
    const mentions: string[] = [];
    let match;
    
    while ((match = this.mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return [...new Set(mentions)]; // Remove duplicates
  }

  // Extract all hashtags from text
  static extractHashtags(text: string): string[] {
    const hashtags: string[] = [];
    let match;
    
    while ((match = this.hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
    
    return [...new Set(hashtags)]; // Remove duplicates
  }

  // Validate username format
  static isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }

  // Validate hashtag format
  static isValidHashtag(hashtag: string): boolean {
    return /^[a-zA-Z0-9_]{1,50}$/.test(hashtag);
  }

  // Clean text for processing (remove extra spaces, etc.)
  static cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n'); // Replace multiple newlines with single newline
  }

  // Check if text contains mentions or hashtags
  static hasSpecialContent(text: string): boolean {
    return this.mentionRegex.test(text) || this.hashtagRegex.test(text);
  }

  // Get character count excluding mentions and hashtags
  static getCharacterCount(text: string): number {
    const segments = this.parseText(text);
    return segments.reduce((count, segment) => {
      if (segment.type === 'text') {
        return count + segment.content.length;
      }
      return count + 1; // Count mentions/hashtags as 1 character
    }, 0);
  }
}

// React component for rendering parsed text
interface ParsedTextProps extends TextParserOptions {
  text: string;
  style?: any;
}

export const ParsedText: React.FC<ParsedTextProps> = ({
  text,
  onMentionPress,
  onHashtagPress,
  mentionColor,
  hashtagColor,
  textColor,
  style,
}) => {
  const { theme } = useTheme();
  const segments = TextParser.parseText(text);

  const defaultMentionColor = mentionColor || theme.primary;
  const defaultHashtagColor = hashtagColor || theme.secondary;
  const defaultTextColor = textColor || theme.text;

  const renderSegment = (segment: ParsedTextSegment, index: number) => {
    const baseStyle = [styles.text, style, { color: defaultTextColor }];

    switch (segment.type) {
      case 'mention':
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onMentionPress?.(segment.value!)}
            disabled={!onMentionPress}
          >
            <Text style={[baseStyle, { color: defaultMentionColor, fontWeight: '600' }]}>
              {segment.content}
            </Text>
          </TouchableOpacity>
        );

      case 'hashtag':
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onHashtagPress?.(segment.value!)}
            disabled={!onHashtagPress}
          >
            <Text style={[baseStyle, { color: defaultHashtagColor, fontWeight: '600' }]}>
              {segment.content}
            </Text>
          </TouchableOpacity>
        );

      default:
        return (
          <Text key={index} style={baseStyle}>
            {segment.content}
          </Text>
        );
    }
  };

  return (
    <Text style={[styles.container, style]}>
      {segments.map((segment, index) => renderSegment(segment, index))}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

// Hook for text parsing
export const useTextParser = () => {
  const parseText = (text: string) => TextParser.parseText(text);
  const extractMentions = (text: string) => TextParser.extractMentions(text);
  const extractHashtags = (text: string) => TextParser.extractHashtags(text);
  const isValidUsername = (username: string) => TextParser.isValidUsername(username);
  const isValidHashtag = (hashtag: string) => TextParser.isValidHashtag(hashtag);
  const cleanText = (text: string) => TextParser.cleanText(text);
  const hasSpecialContent = (text: string) => TextParser.hasSpecialContent(text);
  const getCharacterCount = (text: string) => TextParser.getCharacterCount(text);

  return {
    parseText,
    extractMentions,
    extractHashtags,
    isValidUsername,
    isValidHashtag,
    cleanText,
    hasSpecialContent,
    getCharacterCount,
  };
}; 