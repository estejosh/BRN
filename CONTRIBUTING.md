# Contributing to BRN App

Thank you for your interest in contributing to BRN App! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide device/OS information
- Include screenshots if applicable

### Suggesting Features
- Create a feature request issue
- Describe the feature and its benefits
- Consider implementation complexity
- Check if similar features already exist

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use consistent indentation (2 spaces)

### React Native Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Optimize for performance
- Handle loading and error states
- Follow React Native design patterns

### Testing
- Write unit tests for new components
- Test edge cases and error scenarios
- Ensure good test coverage
- Use React Native Testing Library

### Git Commit Messages
- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, etc.)
- Keep the first line under 50 characters
- Add more details in the body if needed

## 🏗️ Project Structure

```
BRNApp/
├── android/                 # Android native code
├── components/             # Reusable React components
├── src/                    # Source code
│   └── screens/           # Screen components
├── App.tsx                # Main application component
├── index.js               # Entry point
└── README.md             # Project documentation
```

## 🔧 Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Android environment
4. Start Metro: `npx react-native start`
5. Run on Android: `npx react-native run-android`

## 📝 Pull Request Guidelines

### Before Submitting
- Ensure all tests pass
- Update documentation if needed
- Test on both Android and iOS (if applicable)
- Check for any linting errors

### Pull Request Template
- Provide a clear description of changes
- Include screenshots for UI changes
- List any breaking changes
- Reference related issues

## 🐛 Bug Reports

When reporting bugs, please include:
- Device and OS information
- React Native version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or videos if applicable

## 💡 Feature Requests

When suggesting features:
- Explain the problem you're solving
- Describe the proposed solution
- Consider implementation complexity
- Check existing issues first

## 📞 Getting Help

- Check existing issues and discussions
- Join our Discord community
- Email: support@brnapp.com
- Create a new issue for questions

## 🎯 Areas for Contribution

### High Priority
- Backend API development
- Database implementation
- User authentication
- Content management

### Medium Priority
- UI/UX improvements
- Performance optimizations
- Testing coverage
- Documentation

### Low Priority
- Additional features
- Code refactoring
- Tooling improvements

## 📄 License

By contributing to BRN App, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BRN App! 🔥 