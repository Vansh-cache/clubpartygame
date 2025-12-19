# Gender-Based Employee Filtering Guide

## Overview

The application now supports **gender-based filtering** for quiz questions. When you create a question for a specific gender, only employees of that gender will appear in the voting suggestions.

---

## How It Works

### **1. Creating Gender-Specific Questions**

When adding a question in the Admin Panel:

```
┌─────────────────────────────────────┐
│ Question Text:                      │
│ "Best Female Dress"                 │
│                                     │
│ Target Gender:                      │
│ ○ Both (All Employees)             │
│ ○ Male Only                         │
│ ● Female Only          ← SELECT     │
└─────────────────────────────────────┘
```

### **2. Automatic Filtering**

When users vote, they'll only see employees matching the question's gender:

#### Male Question Example:
```
Question: "Best Male Formal Dress"
Gender: Male

Voting List:
✅ John Smith
✅ Aakash Chaudhary
✅ Abhishake Raj
❌ Aanya Singh (hidden - female)
❌ Aatisha Sharma (hidden - female)
```

#### Female Question Example:
```
Question: "Best Female Dress"
Gender: Female

Voting List:
✅ Aanya Singh
✅ Aatisha Sharma
❌ Aakash Chaudhary (hidden - male)
❌ John Smith (hidden - male)
```

#### Both Genders Example:
```
Question: "Best Dressed Employee"
Gender: Both

Voting List:
✅ John Smith
✅ Aakash Chaudhary
✅ Aanya Singh
✅ Aatisha Sharma
(All employees shown)
```

---

## Setup Requirements

### **Step 1: Upload Employee Data with Gender**

Your Excel file **MUST** include gender information:

| Column A | Column B | Column C |
|----------|----------|----------|
| Name     | Gender   | Email    |
| John Smith | Male | john@company.com |
| Aanya Singh | Female | aanya@company.com |
| Aakash Chaudhary | Male | aakash@company.com |
| Aatisha Sharma | Female | aatisha@company.com |

**Accepted Gender Values:**
- `Male`, `M`, `male`, `m`
- `Female`, `F`, `female`, `f`
- `Other`, `other`

### **Step 2: Set Question Gender**

When creating each question, **select the appropriate gender**:

- **Male Only**: For questions like "Best Male Formal Dress", "Best Groomed Man"
- **Female Only**: For questions like "Best Female Dress", "Best Styled Woman"
- **Both**: For questions like "Best Dressed", "Most Creative", "Team Player"

---

## Console Debugging

The application logs filtering information to the console:

```javascript
// Male question
🔵 Question for MALE only. Filtered 15 male employees from 30 total.

// Female question
🟣 Question for FEMALE only. Filtered 12 female employees from 30 total.

// Both genders
🟢 Question for BOTH genders. Showing all 30 employees.
```

Open browser console (F12) to see these logs if you need to debug.

---

## Common Issues & Solutions

### **Issue 1: Male names appearing in female questions**

**Cause**: Question gender not set properly or employee gender data missing

**Solution**:
1. Check the question has the correct gender selected
2. Verify employees have gender in the database (Users tab in Admin Panel)
3. Re-upload Excel with correct gender column

### **Issue 2: No employees showing in voting list**

**Cause**: No employees match the question's gender filter

**Solution**:
1. Check if employees have gender data in database
2. Verify gender values in Excel are correct (Male/Female/Other)
3. Change question gender to "Both" if needed

### **Issue 3: Only some employees have gender**

**Cause**: Excel upload didn't include gender for all employees

**Solution**:
1. Go to Admin Panel → Users tab
2. Click Edit on employees without gender
3. Manually set gender for each employee
4. Or re-upload a complete Excel file with all genders

---

## Best Practices

### ✅ **Do:**

1. **Always set question gender** when creating questions
2. **Include gender in Excel uploads** for all employees
3. **Use "Both" for general questions** that apply to everyone
4. **Test filtering** by checking console logs
5. **Verify employee gender** in Users tab before creating gender-specific questions

### ❌ **Don't:**

1. **Don't forget to set question gender** - defaults to "Both"
2. **Don't use ambiguous names** in questions (be clear about gender)
3. **Don't assume gender** from names - rely on data
4. **Don't create gender-specific questions** without employee gender data

---

## Example Workflow

### **Creating a Female-Only Question:**

1. **Upload Employees** (with gender column)
   ```
   Name          | Gender | Email
   Aanya Singh   | Female | aanya@email.com
   John Smith    | Male   | john@email.com
   ```

2. **Create Question**
   - Text: "Best Female Dress"
   - Gender: **Female Only**
   - Duration: 30 seconds

3. **Go Live**
   - Click "Go Live" button
   - Users will see countdown

4. **Users Vote**
   - Only female employees appear in list
   - Aanya Singh ✅
   - John Smith ❌ (hidden)

5. **Results**
   - Winner announced
   - Only votes for female employees counted

---

## Technical Details

### Filtering Logic

```typescript
// Male questions
if (question.gender === 'male') {
  filteredEmployees = employees
    .filter(emp => emp.gender?.toLowerCase() === 'male')
    .map(emp => emp.name);
}

// Female questions
else if (question.gender === 'female') {
  filteredEmployees = employees
    .filter(emp => emp.gender?.toLowerCase() === 'female')
    .map(emp => emp.name);
}

// Both or undefined
else {
  filteredEmployees = employees.map(emp => emp.name);
}
```

### Database Schema

```javascript
// Question Model
{
  text: String,
  duration: Number,
  gender: String, // 'male', 'female', 'both'
  isActive: Boolean,
  // ...
}

// Employee Model
{
  name: String,
  email: String,
  gender: String, // 'male', 'female', 'other'
  // ...
}
```

---

## FAQ

**Q: Can I change a question's gender after creating it?**  
A: Yes, use the Edit button in the Admin Panel.

**Q: What happens if an employee has no gender?**  
A: They'll only appear in "Both" gender questions, not in male/female-specific ones.

**Q: Can I have questions for "Other" gender?**  
A: Currently only Male, Female, and Both are supported for questions. Employees with "Other" gender will appear in "Both" questions.

**Q: Do I need to delete old employees and re-upload?**  
A: No, you can edit existing employees to add gender information.

**Q: Will old questions still work?**  
A: Yes, questions without gender set will default to "Both" (show all employees).

---

## Summary

✅ **Gender filtering ensures fair and appropriate voting**  
✅ **Simple to set up - just include gender in Excel**  
✅ **Flexible - use Male/Female/Both based on question**  
✅ **Automatic - filtering happens in real-time**  
✅ **Debuggable - check console for filtering logs**  

**Remember**: Always set the question gender when creating gender-specific questions!

