"use client";
import { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Type, 
  Image, 
  Layout, 
  Square, 
  Columns, 
  List,
  Video,
  Code,
  Save,
  Eye,
  Trash2,
  Settings,
  Plus,
  Move,
  Copy,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component types
const COMPONENT_TYPES = {
  HEADING: 'heading',
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  CONTAINER: 'container',
  COLUMNS: 'columns',
  LIST: 'list',
  VIDEO: 'video',
  CODE: 'code',
  SPACER: 'spacer'
};

// Available components for drag and drop
const availableComponents = [
  { type: COMPONENT_TYPES.HEADING, icon: Type, label: 'Rubrik' },
  { type: COMPONENT_TYPES.TEXT, icon: Type, label: 'Text' },
  { type: COMPONENT_TYPES.IMAGE, icon: Image, label: 'Bild' },
  { type: COMPONENT_TYPES.BUTTON, icon: Square, label: 'Knapp' },
  { type: COMPONENT_TYPES.CONTAINER, icon: Layout, label: 'Container' },
  { type: COMPONENT_TYPES.COLUMNS, icon: Columns, label: 'Kolumner' },
  { type: COMPONENT_TYPES.LIST, icon: List, label: 'Lista' },
  { type: COMPONENT_TYPES.VIDEO, icon: Video, label: 'Video' },
  { type: COMPONENT_TYPES.SPACER, icon: Square, label: 'Mellanrum' }
];

// Draggable component from sidebar
function DraggableComponent({ component }: { component: any }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: component.type, isNew: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const ref = useRef<HTMLDivElement | null>(null);
  drag(ref);

  const Icon = component.icon;

  return (
    <div
      ref={ref}
      className={`p-4 bg-white rounded-lg border-2 border-gray-200 cursor-move transition-all ${
        isDragging ? 'opacity-50' : 'hover:border-[#014421] hover:shadow-lg'
      }`}
    >
      <Icon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
      <p className="text-xs text-center text-gray-600">{component.label}</p>
    </div>
  );
}

// Droppable canvas area
function Canvas({ components, onDrop, onUpdate, selectedId, onSelect }: any) {
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        onDrop(item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });

  const ref = useRef<HTMLDivElement | null>(null);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`min-h-[600px] bg-gray-50 rounded-lg p-8 transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300' : 'border-2 border-gray-200'
      }`}
    >
      {components.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Dra komponenter hit för att börja bygga</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {components.map((component: any) => (
            <PageComponent
              key={component.id}
              component={component}
              isSelected={selectedId === component.id}
              onSelect={() => onSelect(component.id)}
              onUpdate={(updates: any) => onUpdate(component.id, updates)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual page component
function PageComponent({ component, isSelected, onSelect, onUpdate }: any) {
  const renderComponent = () => {
    switch (component.type) {
      case COMPONENT_TYPES.HEADING:
        return (
          <h2 
            className="text-3xl font-bold text-gray-900"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ content: e.currentTarget.textContent })}
          >
            {component.content || 'Klicka för att redigera rubrik'}
          </h2>
        );
      
      case COMPONENT_TYPES.TEXT:
        return (
          <p 
            className="text-gray-700"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ content: e.currentTarget.textContent })}
          >
            {component.content || 'Klicka för att redigera text'}
          </p>
        );
      
      case COMPONENT_TYPES.IMAGE:
        return (
          <div className="relative group">
            {component.src ? (
              <img src={component.src} alt={component.alt || ''} className="w-full rounded-lg" />
            ) : (
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Klicka för att ladda upp bild</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case COMPONENT_TYPES.BUTTON:
        return (
          <button 
            className="bg-[#014421] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#116530] transition-colors"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ content: e.currentTarget.textContent })}
          >
            {component.content || 'Knapptext'}
          </button>
        );
      
      case COMPONENT_TYPES.SPACER:
        return (
          <div 
            className="border-2 border-dashed border-gray-300 rounded" 
            style={{ height: component.height || '50px' }}
          />
        );
      
      default:
        return <div>Okänd komponent</div>;
    }
  };

  return (
    <div
      className={`relative p-4 rounded-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-[#014421] bg-[#014421]/5' : 'hover:bg-gray-100'
      }`}
      onClick={onSelect}
    >
      {renderComponent()}
      
      {isSelected && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button className="p-1 bg-white rounded shadow-sm hover:shadow-md">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 bg-white rounded shadow-sm hover:shadow-md">
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 bg-white rounded shadow-sm hover:shadow-md text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function PageBuilder() {
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState('homepage');
  const [previewMode, setPreviewMode] = useState(false);

  const handleDrop = useCallback((item: any) => {
    if (item.isNew) {
      const newComponent = {
        id: `comp-${Date.now()}`,
        type: item.type,
        content: '',
        props: {}
      };
      setComponents([...components, newComponent]);
    }
  }, [components]);

  const handleUpdate = useCallback((id: string, updates: any) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  }, [components]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: selectedPage,
          components
        })
      });
      
      if (res.ok) {
        alert('Sidan har sparats!');
      }
    } catch (error) {
      alert('Kunde inte spara sidan');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sidbyggare</h1>
          <p className="text-gray-600">Dra och släpp komponenter för att bygga sidor</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select 
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="homepage">Startsida</option>
                <option value="about">Om oss</option>
                <option value="courses">Kurser</option>
                <option value="blog">Blogg</option>
              </select>
              
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Redigera' : 'Förhandsgranska'}
              </button>
            </div>
            
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#014421] text-white px-6 py-2 rounded-lg hover:bg-[#116530] transition-colors"
            >
              <Save className="w-4 h-4" />
              Spara ändringar
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-4 gap-6">
          {/* Component sidebar */}
          {!previewMode && (
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Komponenter</h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableComponents.map((component) => (
                    <DraggableComponent key={component.type} component={component} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className={previewMode ? 'col-span-4' : 'col-span-3'}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Canvas
                components={components}
                onDrop={handleDrop}
                onUpdate={handleUpdate}
                selectedId={selectedComponentId}
                onSelect={setSelectedComponentId}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
} 