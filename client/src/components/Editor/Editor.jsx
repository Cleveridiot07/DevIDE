import React from "react";
import AceEditor from "react-ace";

// Import dark theme and mode
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai"; // dark theme
import "ace-builds/src-noconflict/ext-language_tools";

const Editor = ({ onChange,value }) => {
  return (
    <div style={{ width: "100%" }}>
      <AceEditor
        mode="javascript"
        theme="monokai"
        value={value}
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showPrintMargin: false,
        }}
      />
    </div>
  );
};

export default Editor;
