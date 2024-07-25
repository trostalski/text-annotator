import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Docs() {
  return (
    <div className="flex h-full bg-gray-100">
      <main className="flex-1">
        <ScrollArea className="h-full p-6 overflow-auto bg-white shadow-lg prose">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h1 className="text-3xl font-bold mb-4">
                Text Annotator Documentation
              </h1>
              <p className="mb-4">
                Welcome to the Text Annotator tool! This tool allows you to
                create text annotations easily.
              </p>
              <h2 className="text-2xl font-semibold mb-3">Features</h2>
              <ul className="list-disc list-inside mb-4">
                <li>Upload text files to annotate</li>
                <li>Select text to create annotations</li>
                <li>Customizable JSON structure for annotations</li>
                <li>Export annotations as a JSON file</li>
              </ul>
              <h2 className="text-2xl font-semibold mb-3">How to Use</h2>
              <ol className="list-decimal list-inside mb-4">
                <li className="mb-2">
                  Drag and drop a text file or PDF into the designated area, or
                  click to select a file.
                </li>
                <li className="mb-2">
                  Select the text you want to annotate by clicking and dragging
                  your mouse over it.
                </li>
                <li className="mb-2">
                  Click the &quot;Create Annotation&quot; button to create an
                  annotation for the selected text.
                </li>
                <li className="mb-2">
                  Customize the JSON structure of the annotations in the JSON
                  Configuration section.
                </li>
                <li className="mb-2">
                  Export your annotations as a JSON file by clicking the
                  &quot;Export Annotations&quot; button.
                </li>
                <li className="mb-2">
                  To remove a selection, simply select the same text again.
                </li>
              </ol>
              <h2 className="text-2xl font-semibold mb-3">
                JSON Configuration
              </h2>
              <p className="mb-4">
                You can customize the JSON structure of your annotations using
                the template provided in the JSON Configuration section.
                Available template features:
              </p>
              <ul className="list-disc list-inside mb-4">
                <li>
                  <code>{`{{text}}`}</code>: The selected text
                </li>
                <li>
                  <code>{`{{start}}`}</code>: The start index of the selection
                </li>
                <li>
                  <code>{`{{end}}`}</code>: The end index of the selection
                </li>
                <li>
                  <code>{`{{length}}`}</code>: The length of the selection
                </li>
              </ul>
              <Link href="/" className="text-blue-500 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
