# Features

- Upload text files to create json based annotations.
- Select text and hit Enter to create annotations.
- Customizable JSON structure for annotations.
- Export annotations as a JSON file.
- Preserve annotations across page reloads using IndexedDB.

# How to Use

1. Upload a File: Drag and drop a text file or PDF into the designated area, or click to select a file.
2. Customize JSON: Modify the JSON structure of the annotations in the JSON Configuration section.
3. Select Text: Click and drag your mouse over the text to select the part you want to annotate.
4. Create Annotation: Hit Enter or click the "Create Annotation" button to create an annotation for the selected text.
5. Export Annotations: Click the "Export Annotations" button to download your annotations as a JSON file.
6. Remove Selection: To remove a selection, simply select the same text again.

# JSON Configuration

Customize the JSON structure of your annotations using the provided template. Available template features:

- {{text}}: The selected text.
- {{start}}: The start index of the selection.
- {{end}}: The end index of the selection.
- {{length}}: The length of the selection.

# Running the Project

To run the project locally:

1. Install Dependencies: Run `yarn` to install necessary dependencies.
2. Start the Development Server: Run `yarn dev` to start the development server.
3. Open in Browser: Open http://localhost:3000 to view the app.

# License

This project is licensed under the MIT License.
