# Excel Upload Format Guide

## Required Format

Your Excel file should have the following columns:

| Column | Field Name | Required | Valid Values | Notes |
|--------|-----------|----------|--------------|-------|
| **1** | **Name** | ✅ Yes | Any text | Employee name |
| **2** | **Gender** | ❌ No | Male, Female, Other, M, F, or blank | Case-insensitive |
| **3** | **Email** | ❌ No | Valid email or blank | If blank, will be set to "NA" |

---

## Example Excel Format

### Option 1: With Header Row
```
| Name          | Gender | Email                |
|---------------|--------|----------------------|
| John Smith    | Male   | john@company.com     |
| Jane Doe      | Female | jane@company.com     |
| Alex Johnson  | Other  | alex@company.com     |
| Sam Wilson    | M      |                      |
```

### Option 2: Without Header Row
```
| John Smith    | Male   | john@company.com     |
| Jane Doe      | Female | jane@company.com     |
| Alex Johnson  | Other  | alex@company.com     |
| Sam Wilson    | M      |                      |
```

---

## Gender Values

The system accepts multiple formats for gender (case-insensitive):

- **Male**: `Male`, `M`, `male`, `m`
- **Female**: `Female`, `F`, `female`, `f`
- **Other**: `Other`, `other`
- **Blank**: If left empty, gender will be set to `null`

---

## Important Notes

1. **Header Detection**: 
   - The system automatically detects and skips header rows if the first cell contains "Name", "Employee", or "Employee Name"
   - If no header is detected, it starts reading from row 1

2. **Duplicate Handling**: 
   - Duplicate names (case-insensitive) are automatically skipped
   - You'll receive a summary showing how many duplicates were found

3. **Gender Handling**:
   - Gender is in Column 2 (optional)
   - Invalid gender values are ignored (set to `null`)
   - Acceptable formats: Male/M, Female/F, Other
   - Gender will auto-fill during signup when user selects their name

4. **Email Handling**:
   - Email is in Column 3 (optional)
   - If email column is empty or missing, it will be set to "NA"
   - Emails are automatically converted to lowercase

---

## Sample Data

Download this template and fill it with your employee data:

| Name | Gender | Email |
|------|--------|-------|
| John Smith | Male | john@company.com |
| Sarah Jones | Female | sarah@company.com |
| Pat Brown | Other | pat@company.com |
| Chris Lee | Male | |

---

## Upload Process

1. **Prepare** your Excel file with employee data
2. **Click** "Upload Excel file" button in Admin Panel → Questions tab
3. **Select** your `.xlsx` or `.xls` file
4. **Review** the success message showing:
   - Number of employees added
   - Number of duplicates skipped
5. **Check** the Users tab to verify all employees were imported correctly

---

## Troubleshooting

**Problem**: "No valid employee names found"
- **Solution**: Ensure the first column contains employee names

**Problem**: "Invalid file type"
- **Solution**: Only `.xlsx` and `.xls` files are accepted

**Problem**: "Duplicates skipped"
- **Solution**: This is normal - the system prevents duplicate entries

**Problem**: Gender not showing
- **Solution**: Check that gender values are in column 2 and use valid formats (Male/Female/Other or M/F)

---

## Quick Tips

✅ **Do**:
- Use clear, descriptive names in Column 1
- Include gender in Column 2 (Male/Female/Other or M/F)
- Include valid email addresses in Column 3 when available
- Save file as `.xlsx` or `.xls`
- Use the correct column order: Name, Gender, Email

❌ **Don't**:
- Leave the name column empty
- Use special characters in names (stick to letters and spaces)
- Upload files larger than 10MB
- Include sensitive information beyond name/email/gender

---

**Need Help?** Check the Admin Panel for upload status messages and error details.

