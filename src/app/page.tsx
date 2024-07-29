"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Download, Plus, Upload } from "lucide-react";
import { saveData, getData } from "@/lib/indexedDB";
import { useDropzone } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Annotation {
  id: string;
  text: string;
  ranges: { start: number; end: number }[];
  json: string;
  [key: string]: any;
}

const getUniqueID = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default function Home() {
  const [text, setText] = useState<string>("");
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentSelection, setCurrentSelection] = useState<
    { start: number; end: number }[]
  >([]);
  const textRef = useRef<HTMLDivElement>(null);
  const [jsonConfig, setJsonConfig] = useState<string>(`{
  "id": "{{ id }}",
  "content": "{{ text }}",
  "start": "{{ start }}",
  "end": "{{ end }}"
}`);
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    setJsonConfig(newValue);
    try {
      const parsed = JSON.parse(newValue);
      setIsJsonValid(true);
    } catch (error) {
      setIsJsonValid(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const savedText = await getData("annotationText");
      const savedAnnotations = await getData("annotations");
      const savedJsonConfig = await getData("jsonConfig");

      if (savedText) setText(savedText);
      if (savedAnnotations) setAnnotations(savedAnnotations);
      if (savedJsonConfig) setJsonConfig(savedJsonConfig);
      setDataLoaded(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveText = async () => {
      await saveData("annotationText", text);
    };
    if (dataLoaded) {
      saveText();
    }
  }, [text, dataLoaded]);

  useEffect(() => {
    const saveAnnotations = async () => {
      await saveData("annotations", annotations);
    };
    if (dataLoaded) {
      saveAnnotations();
    }
  }, [annotations, dataLoaded]);

  useEffect(() => {
    const saveJsonConfig = async () => {
      await saveData("jsonConfig", jsonConfig);
    };
    if (dataLoaded) {
      saveJsonConfig();
    }
  }, [jsonConfig, dataLoaded]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          const content = e.target.result as string;
          setText(content);
          await saveData("annotationText", content);
        }
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getTextNodeAndOffset = (node: Node, offset: number): [Node, number] => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [node, offset];
    }
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (offset <= child.textContent!.length) {
          return [child, offset];
        }
        offset -= child.textContent!.length;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const [foundNode, foundOffset] = getTextNodeAndOffset(child, offset);
        if (foundNode) {
          return [foundNode, foundOffset];
        }
        offset -= child.textContent!.length;
      }
    }
    return [node, offset];
  };

  const isRangeAnnotated = (start: number, end: number) => {
    return annotations.some((ann) =>
      ann.ranges.some((range) => start < range.end && end > range.start)
    );
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && textRef.current) {
      const range = selection.getRangeAt(0);
      const [startNode, startOffset] = getTextNodeAndOffset(
        range.startContainer,
        range.startOffset
      );
      const [endNode, endOffset] = getTextNodeAndOffset(
        range.endContainer,
        range.endOffset
      );

      const preSelectionRange = document.createRange();
      preSelectionRange.setStart(textRef.current, 0);
      preSelectionRange.setEnd(startNode, startOffset);
      const start = preSelectionRange.toString().length;

      preSelectionRange.setEnd(endNode, endOffset);
      const end = preSelectionRange.toString().length;

      if (start !== end && !isRangeAnnotated(start, end)) {
        setCurrentSelection((prev) => {
          const newSelection = [...prev];
          const isOverlapping = newSelection.findIndex(
            (sel) => start < sel.end && end > sel.start
          );
          if (isOverlapping === -1) {
            newSelection.push({ start, end });
          }
          return newSelection.sort((a, b) => a.start - b.start);
        });
      }
    }
  };

  const applyTemplate = (template: string, values: { [key: string]: any }) => {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      return (
        key
          .split(".")
          .reduce((acc: any, part: any) => acc && acc[part], values) || ""
      );
    });
  };

  const createAnnotation = () => {
    if (currentSelection.length > 0) {
      const ranges = currentSelection.map((range) => ({
        id: getUniqueID(),
        start: range.start,
        end: range.end,
        text: text.substring(range.start, range.end),
      }));

      const newAnnotationJson = applyTemplate(jsonConfig, {
        id: getUniqueID(),
        text: ranges.map((r) => r.text).join(" "),
        start: ranges[0].start,
        end: ranges[ranges.length - 1].end,
        length: ranges.map((r) => r.end - r.start).reduce((a, b) => a + b, 0),
      });

      const newAnnotation: Annotation = {
        id: getUniqueID(),
        text: ranges.map((r) => r.text).join(" "),
        ranges: currentSelection,
        json: newAnnotationJson,
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setCurrentSelection([]);
    }
  };

  const highlightText = () => {
    let result = [];
    let lastIndex = 0;
    const allRanges = [
      ...currentSelection,
      ...annotations.flatMap((ann) => ann.ranges),
    ].sort((a, b) => a.start - b.start);

    for (const range of allRanges) {
      if (range.start > lastIndex) {
        result.push(text.substring(lastIndex, range.start));
      }
      const highlightedText = text.substring(range.start, range.end);
      result.push(
        <span
          key={`${range.start}-${range.end}`}
          className={`px-1 rounded ${
            currentSelection.some(
              (sel) => sel.start === range.start && sel.end === range.end
            )
              ? "bg-blue-200"
              : "bg-yellow-200"
          }`}
        >
          {highlightedText}
        </span>
      );
      lastIndex = range.end;
    }

    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result;
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createAnnotation();
    } else if (e.key === "Escape") {
      setCurrentSelection([]);
    }
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  const exportAnnotations = () => {
    const dataStr = JSON.stringify(
      annotations.map((ann) => JSON.parse(ann.json)),
      null,
      2
    );
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "annotations.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const highlightTemplateFeatures = (json: string) => {
    const regex = /{{\s*(text|start|end|length)\s*}}/g;
    return json.replace(regex, '<span class="bg-green-200">$&</span>');
  };

  return (
    <div className="flex h-full bg-gray-100">
      <main className="flex-1 ">
        <ScrollArea className="h-full p-6 overflow-auto bg-white shadow-lg">
          <div
            {...getRootProps()}
            className={`mb-2 p-2 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-500"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? "Drop the file here"
                : "Drag 'n' drop a file here, or click to select a file"}
            </p>
          </div>
          <div className="mt-4 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="mb-1">
                <p className="text-muted-foreground text-xs">
                  Select text and press <kbd>Enter</kbd> to create an annotation
                  from the selected text.
                </p>
              </div>
              <div className="flex justify-between mb-2">
                <Button
                  onClick={createAnnotation}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={currentSelection.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Annotation
                </Button>
                <Button
                  onClick={() => {
                    setText("");
                    setAnnotations([]);
                    setCurrentSelection([]);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={!text}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Reset Text
                </Button>
              </div>
              <div
                ref={textRef}
                className="whitespace-pre-wrap prose prose-lg max-w-none bg-gray-50 p-6 rounded-md min-h-[300px] cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow overflow-auto"
                onMouseUp={handleTextSelection}
                onDoubleClick={handleTextSelection}
                onKeyDown={handleKeyDown}
                tabIndex={0}
              >
                {text ? (
                  highlightText()
                ) : (
                  <p className="text-gray-400 italic">
                    No text uploaded yet. Use the drop zone above to upload a
                    file.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </main>
      <aside className="w-1/3 p-6 bg-gray-200 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Annotations</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            JSON Configuration
          </label>
          <p className="text-xs text-muted-foreground">
            Specify the structure of the annotation. See Docs for more details.
          </p>
          <Textarea
            value={jsonConfig}
            onChange={handleJsonChange}
            placeholder="Enter JSON config"
            className={`font-mono text-sm p-2 h-64 w-full rounded-md border ${
              isJsonValid ? "border-green-500" : "border-red-500"
            } focus:outline-none focus:ring-2 ${
              isJsonValid ? "focus:ring-green-500" : "focus:ring-red-500"
            }`}
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}
          />
          {!isJsonValid && (
            <p className="mt-2 text-sm text-red-600">Invalid JSON format</p>
          )}
        </div>
        <Button onClick={exportAnnotations} className="mb-4 w-full">
          <Download className="mr-2 h-4 w-4" /> Export Annotations
        </Button>
        {annotations.map((annotation) => (
          <Card key={annotation.id} className="p-4 mb-2 relative">
            <pre
              className="text-xs bg-gray-100 p-2 rounded text-wrap"
              dangerouslySetInnerHTML={{
                __html: highlightTemplateFeatures(annotation.json),
              }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => deleteAnnotation(annotation.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </aside>
    </div>
  );
}
