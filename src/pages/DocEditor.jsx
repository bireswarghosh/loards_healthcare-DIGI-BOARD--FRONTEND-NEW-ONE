import { useEffect, useRef } from 'react';
import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';
import { Inject } from '@syncfusion/ej2-react-documenteditor';
import '@syncfusion/ej2-documenteditor/styles/material.css';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';

DocumentEditorContainerComponent.Inject(Toolbar);



const DocEditor = () => {
  const container = useRef(null);

  useEffect(() => {
    const onResize = () => {
      if (container.current) container.current.resize();
    };
    window.addEventListener('resize', onResize);
    if (container.current) {
      container.current.documentEditor.pageOutline = '#E0E0E0';
      container.current.documentEditor.acceptTab = true;
      container.current.resize();
    }
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <DocumentEditorContainerComponent
        id="docEditorContainer"
        ref={container}
        style={{ display: 'block' }}
        height="100%"

        enableToolbar={true}
        locale="en-US"
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default DocEditor;
