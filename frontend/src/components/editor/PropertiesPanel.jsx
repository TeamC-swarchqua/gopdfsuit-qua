
import { useState } from 'react'
import { Edit, Settings, Trash2, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react'
import { formatProps, parseProps } from './utils'
import { DEFAULT_FONTS } from './constants'

function PropsEditor({ props, onChange, fonts = DEFAULT_FONTS, showAlignment = true, showBorders = true }) {
    const parsed = parseProps(props)

    const updateBorder = (index, value) => {
        const newBorders = [...parsed.borders]
        newBorders[index] = Math.max(0, Math.min(10, value))
        onChange(formatProps({ ...parsed, borders: newBorders }))
    }

    const BorderControls = ({ label, index }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'hsl(var(--muted-foreground))' }}>{label}</label>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <button
                    style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '4px',
                        background: 'hsl(var(--secondary))',
                        color: 'hsl(var(--foreground))',
                        cursor: parsed.borders[index] <= 0 ? 'not-allowed' : 'pointer',
                        opacity: parsed.borders[index] <= 0 ? 0.5 : 1,
                        fontSize: '0.8rem',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => updateBorder(index, parsed.borders[index] - 1)}
                    disabled={parsed.borders[index] <= 0}
                    onMouseEnter={(e) => {
                        if (parsed.borders[index] > 0) e.currentTarget.style.background = 'hsl(var(--accent))'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'hsl(var(--secondary))'
                    }}
                >−</button>
                <span style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', minWidth: '2.5rem', textAlign: 'center', background: 'hsl(var(--muted))', borderRadius: '4px' }}>{parsed.borders[index]}px</span>
                <button
                    style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '4px',
                        background: 'hsl(var(--secondary))',
                        color: 'hsl(var(--foreground))',
                        cursor: parsed.borders[index] >= 10 ? 'not-allowed' : 'pointer',
                        opacity: parsed.borders[index] >= 10 ? 0.5 : 1,
                        fontSize: '0.8rem',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => updateBorder(index, parsed.borders[index] + 1)}
                    disabled={parsed.borders[index] >= 10}
                    onMouseEnter={(e) => {
                        if (parsed.borders[index] < 10) e.currentTarget.style.background = 'hsl(var(--accent))'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'hsl(var(--secondary))'
                    }}
                >+</button>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Font Section */}
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Fuente</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Familia</label>
                        <select value={parsed.font} onChange={(e) => onChange(formatProps({ ...parsed, font: e.target.value }))} style={{ width: '100%', padding: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontSize: '0.85rem' }}>
                            {fonts.map(font => <option key={font.id} value={font.id}>{font.displayName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Tamaño</label>
                        <select value={parsed.size} onChange={(e) => onChange(formatProps({ ...parsed, size: parseInt(e.target.value) }))} style={{ width: '100%', padding: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontSize: '0.85rem' }}>
                            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => <option key={size} value={size}>{size}px</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Style Section */}
            <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Estilo</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[{ key: 0, label: 'B' }, { key: 1, label: 'I' }, { key: 2, label: 'U' }].map(({ key, label }) => (
                        <button key={key} onClick={() => { const s = parsed.style.split(''); s[key] = s[key] === '1' ? '0' : '1'; onChange(formatProps({ ...parsed, style: s.join('') })) }} style={{ padding: '0.4rem 0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: parsed.style[key] === '1' ? 'hsl(var(--accent))' : 'hsl(var(--background))', color: parsed.style[key] === '1' ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))', fontSize: '0.85rem', fontWeight: parsed.style[key] === '1' ? '600' : '400', cursor: 'pointer' }}>{label}</button>
                    ))}
                </div>
            </div>

            {/* Alignment Section */}
            {showAlignment && (
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Alineación</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[
                            { value: 'left', icon: <ArrowLeft size={14} />, label: 'Izquierda' },
                            { value: 'center', icon: <ArrowDown size={14} style={{ transform: 'rotate(0deg)' }} />, label: 'Centro' },
                            { value: 'right', icon: <ArrowRight size={14} />, label: 'Derecha' }
                        ].map(({ value, icon, label }) => (
                            <button key={value} onClick={() => onChange(formatProps({ ...parsed, align: value }))} style={{ flex: 1, padding: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: parsed.align === value ? 'hsl(var(--accent))' : 'hsl(var(--background))', color: parsed.align === value ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                {icon} {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Borders Section */}
            {showBorders && (
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Bordes</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <BorderControls label="Izquierda" index={0} />
                        <BorderControls label="Derecha" index={1} />
                        <BorderControls label="Arriba" index={2} />
                        <BorderControls label="Abajo" index={3} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Ajuste rápido</label>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Ninguno', borders: [0, 0, 0, 0] },
                                { label: 'Todos', borders: [1, 1, 1, 1] },
                                { label: 'Cuadro', borders: [1, 1, 1, 1] },
                                { label: 'Inferior', borders: [0, 0, 0, 1] }
                            ].map(({ label, borders: presetBorders }) => (
                                <button
                                    key={label}
                                    onClick={() => onChange(formatProps({ ...parsed, borders: presetBorders }))}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '4px',
                                        background: 'hsl(var(--secondary))',
                                        color: 'hsl(var(--foreground))',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--accent))'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function PropertiesPanel({ selectedElement, selectedCell, selectedCellElement, updateElement, deleteElement, setSelectedCell, fonts, bookmarks, setBookmarks }) {

    // Helper function to find and update bookmark dest recursively
    const updateBookmarkDest = (bookmarkList, oldDest, newDest) => {
        if (!bookmarkList) return null
        return bookmarkList.map(bookmark => {
            const updated = { ...bookmark }
            if (bookmark.dest === oldDest) {
                if (newDest) {
                    updated.dest = newDest
                } else {
                    delete updated.dest
                }
            }
            if (bookmark.children) {
                updated.children = updateBookmarkDest(bookmark.children, oldDest, newDest)
            }
            return updated
        })
    }

    // Helper to get all destinations from bookmarks (including children)
    const getAllDestinations = (bookmarkList, result = []) => {
        if (!bookmarkList) return result
        bookmarkList.forEach(bookmark => {
            if (bookmark.dest) {
                result.push({ dest: bookmark.dest, title: bookmark.title })
            }
            if (bookmark.children) {
                getAllDestinations(bookmark.children, result)
            }
        })
        return result
    }

    const existingDestinations = getAllDestinations(bookmarks)

    if (!selectedElement) {
        return (
            <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'hsl(var(--muted-foreground))',
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Settings size={24} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Seleccione un componente para editarlo</p>
            </div>
        )
    }

    const handleDelete = () => deleteElement(selectedElement.id)

    // Color preset swatches - using light pastel colors for table backgrounds
    const tableBackgroundPresets = [
        { label: 'Blanco', color: '#FFFFFF' },
        { label: 'Gris claro', color: '#F0F0F0' },
        { label: 'Azul claro', color: '#E3F2FD' },
        { label: 'Verde claro', color: '#E8F5E9' },
        { label: 'Amarillo claro', color: '#FFFDE7' },
        { label: 'Rojo claro', color: '#FFEBEE' }
    ]
    const cellBackgroundPresets = [
        { label: 'Blanco', color: '#FFFFFF' },
        { label: 'Gris claro', color: '#F0F0F0' },
        { label: 'Azul claro', color: '#E3F2FD' },
        { label: 'Verde claro', color: '#E8F5E9' },
        { label: 'Amarillo claro', color: '#FFFDE7' },
        { label: 'Rojo claro', color: '#FFEBEE' }
    ]
    const cellTextPresets = ['#1E1E1E', '#2D2D2D', '#424242', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00']



    return (
        <div style={{
            padding: '1rem',
            flexShrink: 0,
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground))' }}>
                        <Edit size={14} /> Propiedades
                    </h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid hsl(var(--border))' }}>
                    {/* Component Type Badge */}
                    <div style={{
                        display: 'inline-block',
                        padding: '0.3rem 0.65rem',
                        background: 'hsl(var(--accent))',
                        color: 'hsl(var(--accent-foreground))',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                    }}>
                        {selectedElement.type}
                    </div>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '0.35rem 0.65rem',
                            background: 'hsl(var(--destructive))',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        <Trash2 size={12} /> Eliminar
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* TITLE Properties */}
                {selectedElement.type === 'title' && (
                    <>
                        {/* Color de fondo del título */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Color de fondo del título</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={selectedElement.bgcolor || '#ffffff'}
                                    onChange={(e) => updateElement(selectedElement.id, { bgcolor: e.target.value })}
                                    style={{ width: '48px', height: '32px', border: '1px solid hsl(var(--border))', borderRadius: '4px', cursor: 'pointer', padding: '2px', WebkitAppearance: 'none', background: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={selectedElement.bgcolor || '#ffffff'}
                                    onChange={(e) => updateElement(selectedElement.id, { bgcolor: e.target.value })}
                                    placeholder="#RRGGBB o transparente"
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                                <button
                                    onClick={() => updateElement(selectedElement.id, { bgcolor: '' })}
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                {tableBackgroundPresets.map(({ label, color }) => (
                                    <button
                                        key={color}
                                        onClick={() => updateElement(selectedElement.id, { bgcolor: color })}
                                        style={{ width: '24px', height: '24px', border: '1px solid #999', borderRadius: '4px', background: color, cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}
                                        title={label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Color del texto del título */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Color del texto del título</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={selectedElement.textcolor || '#000000'}
                                    onChange={(e) => updateElement(selectedElement.id, { textcolor: e.target.value })}
                                    style={{ width: '48px', height: '32px', border: '1px solid hsl(var(--border))', borderRadius: '4px', cursor: 'pointer', padding: '2px', WebkitAppearance: 'none', background: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={selectedElement.textcolor || '#000000'}
                                    onChange={(e) => updateElement(selectedElement.id, { textcolor: e.target.value })}
                                    placeholder="#RRGGBB (predeterminado: negro)"
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                                <button
                                    onClick={() => updateElement(selectedElement.id, { textcolor: '' })}
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                {cellTextPresets.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateElement(selectedElement.id, { textcolor: color })}
                                        style={{ width: '24px', height: '24px', border: '2px solid hsl(var(--border))', borderRadius: '4px', background: color, cursor: 'pointer' }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Configuración de la tabla del título */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Configuración de la tabla del título</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Columnas:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={selectedElement.table?.maxcolumns || 3}
                                    onChange={(e) => {
                                        const newCols = parseInt(e.target.value) || 3
                                        const currentTable = selectedElement.table || { maxcolumns: 3, columnwidths: [1, 2, 1], rows: [{ row: [{ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }, { props: 'Helvetica:18:100:center:1:1:1:1', text: 'Document Title' }, { props: 'Helvetica:12:000:right:1:1:1:1', text: '' }] }] }
                                        const oldCols = currentTable.maxcolumns
                                        if (newCols !== oldCols) {
                                            const newRows = currentTable.rows.map(row => {
                                                if (newCols > oldCols) {
                                                    // Add columns
                                                    const fillerCells = Array(newCols - oldCols).fill(null).map(() => ({ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }))
                                                    return { row: [...row.row, ...fillerCells] }
                                                } else {
                                                    // Remove columns
                                                    return { row: row.row.slice(0, newCols) }
                                                }
                                            })
                                            const newWidths = Array(newCols).fill(1)
                                            updateElement(selectedElement.id, { table: { ...currentTable, maxcolumns: newCols, columnwidths: newWidths, rows: newRows } })
                                        }
                                    }}
                                    style={{ width: '60px', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        const currentTable = selectedElement.table || { maxcolumns: 3, columnwidths: [1, 2, 1], rows: [{ row: [{ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }, { props: 'Helvetica:18:100:center:1:1:1:1', text: 'Document Title' }, { props: 'Helvetica:12:000:right:1:1:1:1', text: '' }] }] }
                                        const newRow = { row: Array(currentTable.maxcolumns).fill(null).map(() => ({ props: 'Helvetica:12:000:left:1:1:1:1', text: '' })) }
                                        updateElement(selectedElement.id, { table: { ...currentTable, rows: [...currentTable.rows, newRow] } })
                                    }}
                                    style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Añadir fila
                                </button>
                                <button
                                    onClick={() => {
                                        const currentTable = selectedElement.table || { maxcolumns: 3, columnwidths: [1, 2, 1], rows: [{ row: [{ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }, { props: 'Helvetica:18:100:center:1:1:1:1', text: 'Document Title' }, { props: 'Helvetica:12:000:right:1:1:1:1', text: '' }] }] }
                                        const newCols = currentTable.maxcolumns + 1
                                        if (newCols > 5) return
                                        const newRows = currentTable.rows.map(row => ({ row: [...row.row, { props: 'Helvetica:12:000:left:1:1:1:1', text: '' }] }))
                                        const newWidths = [...(currentTable.columnwidths || []), 1]
                                        updateElement(selectedElement.id, { table: { ...currentTable, maxcolumns: newCols, columnwidths: newWidths, rows: newRows } })
                                    }}
                                    style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Añadir columna
                                </button>
                                {selectedCell && (
                                    <button
                                        onClick={() => {
                                            const currentTable = selectedElement.table || { maxcolumns: 3, columnwidths: [1, 2, 1], rows: [{ row: [{ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }, { props: 'Helvetica:18:100:center:1:1:1:1', text: 'Document Title' }, { props: 'Helvetica:12:000:right:1:1:1:1', text: '' }] }] }
                                            if (currentTable.maxcolumns <= 1) return
                                            const colToRemove = selectedCell.colIdx
                                            const newRows = currentTable.rows.map(row => ({ row: row.row.filter((_, idx) => idx !== colToRemove) }))
                                            const newWidths = (currentTable.columnwidths || []).filter((_, idx) => idx !== colToRemove)
                                            updateElement(selectedElement.id, { table: { ...currentTable, maxcolumns: currentTable.maxcolumns - 1, columnwidths: newWidths, rows: newRows } })
                                            setSelectedCell(null)
                                        }}
                                        style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--destructive))', borderRadius: '4px', background: 'hsl(var(--destructive))', color: 'white', cursor: 'pointer', gridColumn: 'span 2' }}
                                    >
                                        Eliminar columna (Col. {selectedCell.colIdx + 1})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bordes de la tabla del título Toggle */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Bordes de la tabla del título</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        // Toggle all borders to 1:1:1:1
                                        const currentTable = selectedElement.table || { maxcolumns: 3, columnwidths: [1, 2, 1], rows: [{ row: [{ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }, { props: 'Helvetica:18:100:center:1:1:1:1', text: 'Document Title' }, { props: 'Helvetica:12:000:right:1:1:1:1', text: '' }] }] }
                                        const updatedRows = currentTable.rows.map(row => ({
                                            ...row,
                                            row: row.row.map(cell => {
                                                const parsed = parseProps(cell.props)
                                                return { ...cell, props: formatProps({ ...parsed, borders: [1, 1, 1, 1] }) }
                                            })
                                        }))
                                        updateElement(selectedElement.id, { table: { ...currentTable, rows: updatedRows } })
                                    }}
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Activar todos los bordes
                                </button>
                                <button
                                    onClick={() => {
                                        // Toggle all borders to 0:0:0:0
                                        const currentTable = selectedElement.table || { maxcolumns: 3, columnwidths: [1, 2, 1], rows: [{ row: [{ props: 'Helvetica:12:000:left:1:1:1:1', text: '' }, { props: 'Helvetica:18:100:center:1:1:1:1', text: 'Document Title' }, { props: 'Helvetica:12:000:right:1:1:1:1', text: '' }] }] }
                                        const updatedRows = currentTable.rows.map(row => ({
                                            ...row,
                                            row: row.row.map(cell => {
                                                const parsed = parseProps(cell.props)
                                                return { ...cell, props: formatProps({ ...parsed, borders: [0, 0, 0, 0] }) }
                                            })
                                        }))
                                        updateElement(selectedElement.id, { table: { ...currentTable, rows: updatedRows } })
                                    }}
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Desactivar todos los bordes
                                </button>
                            </div>
                        </div>

                        {/* Title Cell Editing */}
                        {selectedCell && selectedCellElement && (
                            <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px', border: '1px solid hsl(var(--border))' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                    Celda del título (Fila {selectedCell.rowIdx + 1}, Col. {selectedCell.colIdx + 1})
                                </h4>

                                {/* Cell Text */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Texto:</label>
                                    <input
                                        type="text"
                                        value={selectedCellElement.text || ''}
                                        onChange={(e) => {
                                            const newRows = [...selectedElement.table.rows]
                                            newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], text: e.target.value }
                                            updateElement(selectedElement.id, { table: { ...selectedElement.table, rows: newRows } })
                                        }}
                                        placeholder="Texto de la celda"
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                    />
                                </div>

                                {/* Add Image */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Añadir imagen:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onload = (event) => {
                                                    const newRows = [...selectedElement.table.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                        ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                        image: {
                                                            imagename: file.name,
                                                            imagedata: event.target.result,
                                                            width: 100,
                                                            height: 50
                                                        }
                                                    }
                                                    updateElement(selectedElement.id, { table: { ...selectedElement.table, rows: newRows } })
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                        style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                    />
                                </div>

                                {/* Cell Styling */}
                                <PropsEditor
                                    props={selectedCellElement.props}
                                    onChange={(newProps) => {
                                        const newRows = [...selectedElement.table.rows]
                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], props: newProps }
                                        updateElement(selectedElement.id, { table: { ...selectedElement.table, rows: newRows } })
                                    }}
                                    fonts={fonts}
                                />

                                {/* URL del enlace */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>URL del enlace:</label>
                                    <input
                                        type="text"
                                        value={selectedCellElement.link || ''}
                                        onChange={(e) => {
                                            const newRows = [...selectedElement.table.rows]
                                            newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], link: e.target.value }
                                            updateElement(selectedElement.id, { table: { ...selectedElement.table, rows: newRows } })
                                        }}
                                        placeholder="https://..."
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* TABLE Properties */}
                {selectedElement.type === 'table' && (
                    <>
                        {/* Column Count and Layout Controls */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Tabla</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', minWidth: '60px' }}>Columnas:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={selectedElement.maxcolumns || 3}
                                    readOnly
                                    style={{ width: '60px', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        const newRow = { row: Array(selectedElement.maxcolumns).fill(null).map(() => ({ props: 'Helvetica:12:000:left:1:1:1:1', text: '' })) }
                                        updateElement(selectedElement.id, { rows: [...(selectedElement.rows || []), newRow] })
                                    }}
                                    style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    + Añadir fila
                                </button>
                                <button
                                    onClick={() => {
                                        if ((selectedElement.rows?.length || 0) <= 1) return
                                        const newRows = selectedElement.rows.slice(0, -1)
                                        updateElement(selectedElement.id, { rows: newRows })
                                    }}
                                    style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Eliminar fila (última)
                                </button>
                                <button
                                    onClick={() => {
                                        const newCols = (selectedElement.maxcolumns || 3) + 1
                                        if (newCols > 10) return
                                        const newWidths = selectedElement.columnwidths ? [...selectedElement.columnwidths, 1] : Array(newCols).fill(1)
                                        const updatedRows = selectedElement.rows.map(r => ({ row: [...r.row, { props: 'Helvetica:12:000:left:1:1:1:1', text: '' }] }))
                                        updateElement(selectedElement.id, { maxcolumns: newCols, rows: updatedRows, columnwidths: newWidths })
                                    }}
                                    style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    + Añadir columna
                                </button>
                                <button
                                    onClick={() => {
                                        const newCols = (selectedElement.maxcolumns || 3) - 1
                                        if (newCols < 1) return
                                        const updatedRows = selectedElement.rows.map(r => ({ row: r.row.slice(0, -1) }))
                                        const newWidths = selectedElement.columnwidths ? selectedElement.columnwidths.slice(0, -1) : undefined
                                        updateElement(selectedElement.id, { maxcolumns: newCols, rows: updatedRows, columnwidths: newWidths })
                                    }}
                                    style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Eliminar columna (última)
                                </button>
                                {selectedCell && (
                                    <button
                                        onClick={() => {
                                            if ((selectedElement.maxcolumns || 3) <= 1) return
                                            const colToRemove = selectedCell.colIdx
                                            const newCols = (selectedElement.maxcolumns || 3) - 1

                                            // Update rows by removing the cell at the selected column index
                                            const updatedRows = selectedElement.rows.map(r => ({
                                                row: r.row.filter((_, idx) => idx !== colToRemove)
                                            }))

                                            // Update column widths by removing the width at the selected column index
                                            const newWidths = selectedElement.columnwidths
                                                ? selectedElement.columnwidths.filter((_, idx) => idx !== colToRemove)
                                                : undefined

                                            updateElement(selectedElement.id, { maxcolumns: newCols, rows: updatedRows, columnwidths: newWidths })
                                            setSelectedCell(null)
                                        }}
                                        style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--destructive))', borderRadius: '4px', background: 'hsl(var(--destructive))', color: 'white', cursor: 'pointer', gridColumn: 'span 2' }}
                                    >
                                        Eliminar columna (Col. {selectedCell.colIdx + 1})
                                    </button>
                                )}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                Filas: {selectedElement.rows?.length || 0}, Columnas: {selectedElement.maxcolumns || 3}
                            </div>
                        </div>

                        {/* Bordes de la tabla Toggle */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Bordes de la tabla</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        // Toggle all borders to 1:1:1:1
                                        const updatedRows = selectedElement.rows.map(row => ({
                                            ...row,
                                            row: row.row.map(cell => {
                                                const parsed = parseProps(cell.props)
                                                return { ...cell, props: formatProps({ ...parsed, borders: [1, 1, 1, 1] }) }
                                            })
                                        }))
                                        updateElement(selectedElement.id, { rows: updatedRows })
                                    }}
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Activar todos los bordes
                                </button>
                                <button
                                    onClick={() => {
                                        // Toggle all borders to 0:0:0:0
                                        const updatedRows = selectedElement.rows.map(row => ({
                                            ...row,
                                            row: row.row.map(cell => {
                                                const parsed = parseProps(cell.props)
                                                return { ...cell, props: formatProps({ ...parsed, borders: [0, 0, 0, 0] }) }
                                            })
                                        }))
                                        updateElement(selectedElement.id, { rows: updatedRows })
                                    }}
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', cursor: 'pointer' }}
                                >
                                    Desactivar todos los bordes
                                </button>
                            </div>
                        </div>

                        {/* Column Widths */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Ancho de columnas (pesos)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {Array.from({ length: selectedElement.maxcolumns || 3 }).map((_, idx) => {
                                    const currentWidths = selectedElement.columnwidths || Array(selectedElement.maxcolumns).fill(1)
                                    return (
                                        <div key={idx}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Col. {idx + 1}</label>
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                value={currentWidths[idx] || 1}
                                                onChange={(e) => {
                                                    const newWidths = [...currentWidths]
                                                    newWidths[idx] = parseFloat(e.target.value) || 1
                                                    updateElement(selectedElement.id, { columnwidths: newWidths })
                                                }}
                                                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    const equalWidths = Array(selectedElement.maxcolumns).fill(1)
                                    updateElement(selectedElement.id, { columnwidths: equalWidths })
                                }}
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                            >
                                Restablecer igual
                            </button>
                        </div>

                        {/* Row Heights */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Alto de filas (multiplicadores)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                {selectedElement.rows?.map((row, idx) => {
                                    const rowHeight = row.height || 1.0
                                    return (
                                        <div key={idx}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Fila {idx + 1}</label>
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                value={rowHeight}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[idx] = { ...newRows[idx], height: parseFloat(e.target.value) || 1.0 }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    const newRows = selectedElement.rows.map(row => ({ ...row, height: 1.0 }))
                                    updateElement(selectedElement.id, { rows: newRows })
                                }}
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                            >
                                Restablecer predeterminado
                            </button>
                        </div>

                        {/* Color de fondo de la tabla */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Color de fondo de la tabla</label>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                Establece el color de fondo predeterminado de todas las celdas. Cada celda puede cambiarlo.
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={selectedElement.bgcolor || '#ffffff'}
                                    onChange={(e) => updateElement(selectedElement.id, { bgcolor: e.target.value })}
                                    style={{ width: '48px', height: '32px', border: '1px solid hsl(var(--border))', borderRadius: '4px', cursor: 'pointer', padding: '2px', WebkitAppearance: 'none', background: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={selectedElement.bgcolor || '#ffffff'}
                                    onChange={(e) => updateElement(selectedElement.id, { bgcolor: e.target.value })}
                                    placeholder="#RRGGBB o transparente"
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                                <button
                                    onClick={() => updateElement(selectedElement.id, { bgcolor: '' })}
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                {tableBackgroundPresets.map(({ label, color }) => (
                                    <button
                                        key={color}
                                        onClick={() => updateElement(selectedElement.id, { bgcolor: color })}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            border: selectedElement.bgcolor === color ? '2px solid #3b82f6' : '2px solid hsl(var(--border))',
                                            borderRadius: '6px',
                                            background: color,
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title={label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Color del texto de la tabla */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Color del texto de la tabla</label>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                Establece el color del texto predeterminado de todas las celdas. Cada celda puede cambiarlo.
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={selectedElement.textcolor || '#000000'}
                                    onChange={(e) => updateElement(selectedElement.id, { textcolor: e.target.value })}
                                    style={{ width: '48px', height: '32px', border: '1px solid hsl(var(--border))', borderRadius: '4px', cursor: 'pointer', padding: '2px', WebkitAppearance: 'none', background: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={selectedElement.textcolor || '#000000'}
                                    onChange={(e) => updateElement(selectedElement.id, { textcolor: e.target.value })}
                                    placeholder="#RRGGBB (predeterminado: negro)"
                                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                                <button
                                    onClick={() => updateElement(selectedElement.id, { textcolor: '' })}
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                {cellTextPresets.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateElement(selectedElement.id, { textcolor: color })}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            border: selectedElement.textcolor === color ? '2px solid #3b82f6' : '2px solid hsl(var(--border))',
                                            borderRadius: '6px',
                                            background: color,
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Cell Editing */}
                        {selectedCell && selectedCellElement && (
                            <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px', border: '1px solid hsl(var(--border))' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                    Celda (Fila {selectedCell.rowIdx + 1}, Col. {selectedCell.colIdx + 1})
                                </h4>

                                {/* Form Field Properties - show if cell has form_field */}
                                {selectedCellElement.form_field && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px', border: '1px solid hsl(var(--border))' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
                                            {selectedCellElement.form_field.type === 'radio' ? '🔘 Botón de opción' : selectedCellElement.form_field.type === 'text' ? '📝 Campo de texto' : '☑️ Casilla'}
                                        </label>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Nombre del campo:</label>
                                            <input
                                                type="text"
                                                value={selectedCellElement.form_field.name || ''}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                        ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                        form_field: {
                                                            ...selectedCellElement.form_field,
                                                            name: e.target.value
                                                        }
                                                    }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                placeholder="Escriba el nombre del campo (ej.: patient_name)"
                                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            />
                                        </div>
                                        {selectedCellElement.form_field.type === 'text' && (
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Valor predeterminado:</label>
                                                <input
                                                    type="text"
                                                    value={selectedCellElement.form_field.value || ''}
                                                    onChange={(e) => {
                                                        const newRows = [...selectedElement.rows]
                                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                            ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                            form_field: {
                                                                ...selectedCellElement.form_field,
                                                                value: e.target.value
                                                            }
                                                        }
                                                        updateElement(selectedElement.id, { rows: newRows })
                                                    }}
                                                    placeholder="Valor predeterminado"
                                                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                                />
                                            </div>
                                        )}
                                        {(selectedCellElement.form_field.type === 'radio' || selectedCellElement.form_field.type === 'checkbox') && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCellElement.form_field.checked || false}
                                                    onChange={(e) => {
                                                        const newRows = [...selectedElement.rows]
                                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                            ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                            form_field: {
                                                                ...selectedCellElement.form_field,
                                                                checked: e.target.checked
                                                            }
                                                        }
                                                        updateElement(selectedElement.id, { rows: newRows })
                                                    }}
                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                />
                                                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground))' }}>Marcado por defecto</label>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                    ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                    form_field: undefined,
                                                    text: ''
                                                }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ marginTop: '0.5rem', width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--destructive))', borderRadius: '4px', background: 'transparent', color: 'hsl(var(--destructive))', cursor: 'pointer' }}
                                        >
                                            Quitar campo de formulario
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                const cellType = selectedCellElement.form_field.type
                                                if (cellType === 'checkbox') {
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                        ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                        form_field: undefined,
                                                        chequebox: selectedCellElement.form_field.checked || false
                                                    }
                                                } else if (cellType === 'radio') {
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                        ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                        form_field: undefined,
                                                        radio: selectedCellElement.form_field.checked || false
                                                    }
                                                }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ marginTop: '0.35rem', width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'transparent', color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }}
                                            disabled={selectedCellElement.form_field.type === 'text'}
                                            title={selectedCellElement.form_field.type === 'text' ? 'Los campos de texto no se pueden convertir a simple' : 'Convertir a elemento simple (sin formulario)'}
                                        >
                                            Convertir a simple
                                        </button>
                                    </div>
                                )}

                                {/* Simple Checkbox Properties - show if cell has chequebox */}
                                {selectedCellElement.chequebox !== undefined && !selectedCellElement.form_field && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px', border: '1px solid hsl(var(--border))' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
                                            ☑️ Casilla simple
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCellElement.chequebox || false}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                        ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                        chequebox: e.target.checked
                                                    }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                            />
                                            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground))' }}>Marcado</label>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                    ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                    chequebox: undefined,
                                                    form_field: { name: `checkbox_${Date.now()}`, checked: selectedCellElement.chequebox || false, type: 'checkbox' }
                                                }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--primary))', borderRadius: '4px', background: 'transparent', color: 'hsl(var(--primary))', cursor: 'pointer' }}
                                        >
                                            Convertir a campo de formulario
                                        </button>
                                    </div>
                                )}

                                {/* Simple Radio Properties - show if cell has radio */}
                                {selectedCellElement.radio !== undefined && !selectedCellElement.form_field && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px', border: '1px solid hsl(var(--border))' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
                                            🔘 Opción simple
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                checked={selectedCellElement.radio || false}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                        ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                        radio: e.target.checked
                                                    }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                            />
                                            <label style={{ fontSize: '0.75rem', color: 'hsl(var(--foreground))' }}>Seleccionado</label>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                    ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                    radio: undefined,
                                                    form_field: { name: `radio_${Date.now()}`, checked: selectedCellElement.radio || false, type: 'radio' }
                                                }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--primary))', borderRadius: '4px', background: 'transparent', color: 'hsl(var(--primary))', cursor: 'pointer' }}
                                        >
                                            Convertir a campo de formulario
                                        </button>
                                    </div>
                                )}

                                {/* Propiedades de la imagen - show if cell has image */}
                                {selectedCellElement.image && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '6px', border: '1px solid hsl(var(--border))' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Propiedades de la imagen</label>

                                        {/* Origen de la imagen */}
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Origen:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onload = (event) => {
                                                            const newRows = [...selectedElement.rows]
                                                            newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                                ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                                image: {
                                                                    ...selectedCellElement.image,
                                                                    imagename: file.name,
                                                                    imagedata: event.target.result
                                                                }
                                                            }
                                                            updateElement(selectedElement.id, { rows: newRows })
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            />
                                            {selectedCellElement.image.imagename && (
                                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                                                    Actual: {selectedCellElement.image.imagename}
                                                </div>
                                            )}
                                        </div>

                                        {/* Dimensiones */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Ancho (px)</label>
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="800"
                                                    value={selectedCellElement.image.width || 100}
                                                    onChange={(e) => {
                                                        const newRows = [...selectedElement.rows]
                                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                            ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                            image: {
                                                                ...selectedCellElement.image,
                                                                width: parseInt(e.target.value) || 100
                                                            }
                                                        }
                                                        updateElement(selectedElement.id, { rows: newRows })
                                                    }}
                                                    style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Alto (px)</label>
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="800"
                                                    value={selectedCellElement.image.height || 80}
                                                    onChange={(e) => {
                                                        const newRows = [...selectedElement.rows]
                                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                            ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                            image: {
                                                                ...selectedCellElement.image,
                                                                height: parseInt(e.target.value) || 80
                                                            }
                                                        }
                                                        updateElement(selectedElement.id, { rows: newRows })
                                                    }}
                                                    style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                    ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                    image: undefined,
                                                    text: ''
                                                }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ marginTop: '0.5rem', width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--destructive))', borderRadius: '4px', background: 'transparent', color: 'hsl(var(--destructive))', cursor: 'pointer' }}
                                        >
                                            Quitar imagen
                                        </button>
                                    </div>
                                )}

                                {/* Cell Text - hide if form_field or image exists */}
                                {!selectedCellElement.form_field && !selectedCellElement.image && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Texto:</label>
                                        <input
                                            type="text"
                                            value={selectedCellElement.text || ''}
                                            onChange={(e) => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], text: e.target.value }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            placeholder="Texto de la celda"
                                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                        />
                                    </div>
                                )}

                                {/* Cell Styling */}
                                <PropsEditor
                                    props={selectedCellElement.props}
                                    onChange={(newProps) => {
                                        const newRows = [...selectedElement.rows]
                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], props: newProps }
                                        updateElement(selectedElement.id, { rows: newRows })
                                    }}
                                    fonts={fonts}
                                />

                                {/* URL del enlace */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>URL del enlace:</label>
                                    <input
                                        type="text"
                                        value={selectedCellElement.link || ''}
                                        onChange={(e) => {
                                            const newRows = [...selectedElement.rows]
                                            newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], link: e.target.value }
                                            updateElement(selectedElement.id, { rows: newRows })
                                        }}
                                        placeholder="https://... o #bookmark-id"
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                    />
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
                                        Use el prefijo # para enlaces internos (ej.: #section-id)
                                    </div>
                                </div>

                                {/* Destination ID (dest) for bookmark target */}
                                <div style={{ marginTop: '0.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>ID de destino (dest):</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={selectedCellElement.dest || ''}
                                            onChange={(e) => {
                                                const oldDest = selectedCellElement.dest
                                                const newDest = e.target.value || undefined
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], dest: newDest }
                                                updateElement(selectedElement.id, { rows: newRows })

                                                // Sync with bookmarks if the old dest was referenced
                                                if (oldDest && setBookmarks && bookmarks) {
                                                    const updatedBookmarks = updateBookmarkDest(bookmarks, oldDest, newDest)
                                                    setBookmarks(updatedBookmarks)
                                                }
                                            }}
                                            placeholder="ej.: financial-summary"
                                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                        />
                                        {existingDestinations.length > 0 && !selectedCellElement.dest && (
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const newRows = [...selectedElement.rows]
                                                        newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], dest: e.target.value }
                                                        updateElement(selectedElement.id, { rows: newRows })
                                                    }
                                                }}
                                                style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {existingDestinations.map(({ dest, title }) => (
                                                    <option key={dest} value={dest}>📑 {title} → {dest}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    {selectedCellElement.dest && existingDestinations.find(d => d.dest === selectedCellElement.dest) && (
                                        <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            ✓ Vinculado al marcador: &quot;{existingDestinations.find(d => d.dest === selectedCellElement.dest)?.title}&quot;
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
                                        ID usado como destino de marcador para enlaces internos
                                    </div>
                                </div>

                                {/* Tamaño personalizado de celda */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Tamaño personalizado de celda</label>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                        ⚠️ Use solo el control azul (ajuste a la derecha para el ancho; al cambiar el alto se actualiza el valor en el JSON).
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Ancho (px):</label>
                                            <input
                                                type="number"
                                                min="10"
                                                value={selectedCellElement.width || ''}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    const val = e.target.value ? parseInt(e.target.value) : undefined
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], width: val }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                placeholder="Automático"
                                                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Alto (px):</label>
                                            <input
                                                type="number"
                                                min="10"
                                                value={selectedCellElement.height || ''}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    const val = e.target.value ? parseInt(e.target.value) : undefined
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], height: val }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                placeholder="Automático"
                                                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Color de fondo de la celda */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Color de fondo de la celda</label>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                        Sobrescribe (desde bgcolor #FFFFFF)
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', width: '48px', height: '32px', borderRadius: '4px', border: '2px solid hsl(var(--border))', overflow: 'hidden' }}>
                                            <input
                                                type="color"
                                                value={selectedCellElement.bgcolor || '#ffffff'}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], bgcolor: e.target.value }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{ width: '60px', height: '40px', border: 'none', cursor: 'pointer', padding: 0, margin: '-4px', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={selectedCellElement.bgcolor || ''}
                                            onChange={(e) => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], bgcolor: e.target.value }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            placeholder="#RRGGBB"
                                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                        />
                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], bgcolor: undefined }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        {cellBackgroundPresets.map(({ label, color }) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], bgcolor: color }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    border: selectedCellElement.bgcolor === color ? '2px solid #3b82f6' : '2px solid hsl(var(--border))',
                                                    borderRadius: '6px',
                                                    background: color,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title={label}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Color del texto de la celda */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Color del texto de la celda</label>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                        Establece el color del texto (predeterminado: negro)
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', width: '48px', height: '32px', borderRadius: '4px', border: '2px solid hsl(var(--border))', overflow: 'hidden' }}>
                                            <input
                                                type="color"
                                                value={selectedCellElement.textcolor || '#000000'}
                                                onChange={(e) => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], textcolor: e.target.value }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{ width: '60px', height: '40px', border: 'none', cursor: 'pointer', padding: 0, margin: '-4px', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={selectedCellElement.textcolor || ''}
                                            onChange={(e) => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], textcolor: e.target.value }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            placeholder="#RRGGBB"
                                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                        />
                                        <button
                                            onClick={() => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], textcolor: undefined }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', cursor: 'pointer' }}
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        {cellTextPresets.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const newRows = [...selectedElement.rows]
                                                    newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = { ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx], textcolor: color }
                                                    updateElement(selectedElement.id, { rows: newRows })
                                                }}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    border: selectedCellElement.textcolor === color ? '2px solid #3b82f6' : '2px solid hsl(var(--border))',
                                                    borderRadius: '6px',
                                                    background: color,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Ajuste de texto Toggle */}
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Ajuste de texto</label>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                        Activa el ajuste de texto y el alto de fila automático
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCellElement.wrap === true}
                                            onChange={(e) => {
                                                const newRows = [...selectedElement.rows]
                                                newRows[selectedCell.rowIdx].row[selectedCell.colIdx] = {
                                                    ...newRows[selectedCell.rowIdx].row[selectedCell.colIdx],
                                                    wrap: e.target.checked ? true : undefined
                                                }
                                                updateElement(selectedElement.id, { rows: newRows })
                                            }}
                                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))' }}>
                                            Activar ajuste automático de texto
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* FOOTER Properties */}
                {selectedElement.type === 'footer' && (
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Texto:</label>
                            <input
                                type="text"
                                value={selectedElement.text || ''}
                                onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                        </div>
                        <PropsEditor
                            props={selectedElement.props}
                            onChange={(newProps) => updateElement(selectedElement.id, { props: newProps })}
                            fonts={fonts}
                        />
                    </>
                )}

                {/* IMAGE Properties */}
                {selectedElement.type === 'image' && (
                    <>
                        {/* Image Upload/Change */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Origen de la imagen</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onload = (event) => {
                                            updateElement(selectedElement.id, {
                                                imagename: file.name,
                                                imagedata: event.target.result
                                            })
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                                style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                            {selectedElement.imagename && (
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem', wordBreak: 'break-all' }}>
                                    Actual: {selectedElement.imagename}
                                </div>
                            )}
                        </div>

                        {/* Image Dimensiones */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>Dimensiones</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Ancho (px)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="1000"
                                        value={selectedElement.width || 200}
                                        onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 200 })}
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Alto (px)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="1000"
                                        value={selectedElement.height || 150}
                                        onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 150 })}
                                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* URL del enlace */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>URL del enlace</label>
                            <input
                                type="text"
                                value={selectedElement.link || ''}
                                onChange={(e) => updateElement(selectedElement.id, { link: e.target.value })}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                        </div>
                    </>
                )}

                {/* SPACER Properties */}
                {selectedElement.type === 'spacer' && (
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Alto (px):</label>
                        <input
                            type="number"
                            min="1"
                            max="200"
                            value={selectedElement.height || 20}
                            onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 20 })}
                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                        />
                    </div>
                )}

                {/* IMAGE Properties */}
                {selectedElement.type === 'image' && (
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Seleccionar imagen:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onload = (event) => {
                                            updateElement(selectedElement.id, {
                                                imagedata: event.target.result.split(',')[1],
                                                imagename: file.name
                                            })
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Nombre de la imagen:</label>
                            <input
                                type="text"
                                value={selectedElement.imagename || ''}
                                onChange={(e) => updateElement(selectedElement.id, { imagename: e.target.value })}
                                placeholder="Nombre de la imagen"
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Ancho (px):</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="800"
                                    value={selectedElement.width || 200}
                                    onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 200 })}
                                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Alto (px):</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="800"
                                    value={selectedElement.height || 150}
                                    onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 150 })}
                                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>URL del enlace:</label>
                            <input
                                type="text"
                                value={selectedElement.link || ''}
                                onChange={(e) => updateElement(selectedElement.id, { link: e.target.value })}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Bookmark Editor Section */}
            {setBookmarks && (
                <div className="card" style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: '600', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📑 Marcadores ({bookmarks?.length || 0})
                    </h4>

                    {(!bookmarks || bookmarks.length === 0) ? (
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center', padding: '1rem 0' }}>
                            No hay marcadores definidos
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {bookmarks.map((bookmark, idx) => (
                                <BookmarkItem
                                    key={idx}
                                    bookmark={bookmark}
                                    index={idx}
                                    depth={0}
                                    bookmarks={bookmarks}
                                    setBookmarks={setBookmarks}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            const newBookmark = { title: 'Nuevo marcador', page: 1 }
                            setBookmarks([...(bookmarks || []), newBookmark])
                        }}
                        style={{
                            marginTop: '0.75rem',
                            width: '100%',
                            padding: '0.5rem',
                            fontSize: '0.8rem',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '4px',
                            background: 'hsl(var(--secondary))',
                            color: 'hsl(var(--foreground))',
                            cursor: 'pointer'
                        }}
                    >
                        + Añadir marcador
                    </button>
                </div>
            )}
        </div>
    )
}

// BookmarkItem component for recursive bookmark tree rendering
function BookmarkItem({ bookmark, index, depth, bookmarks, setBookmarks, parentPath = [] }) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    const path = [...parentPath, index]

    const updateBookmark = (updates) => {
        const newBookmarks = JSON.parse(JSON.stringify(bookmarks))
        let target = newBookmarks
        for (let i = 0; i < path.length - 1; i++) {
            target = target[path[i]].children
        }
        target[path[path.length - 1]] = { ...target[path[path.length - 1]], ...updates }
        setBookmarks(newBookmarks)
    }

    const deleteBookmark = () => {
        const newBookmarks = JSON.parse(JSON.stringify(bookmarks))
        let target = newBookmarks
        let parent = null
        for (let i = 0; i < path.length - 1; i++) {
            parent = target[path[i]]
            target = target[path[i]].children
        }
        target.splice(path[path.length - 1], 1)
        // Clean up empty children arrays
        if (parent && target.length === 0) {
            delete parent.children
        }
        setBookmarks(newBookmarks)
    }

    const addChild = () => {
        const newBookmarks = JSON.parse(JSON.stringify(bookmarks))
        let target = newBookmarks
        for (let i = 0; i < path.length - 1; i++) {
            target = target[path[i]].children
        }
        const currentBookmark = target[path[path.length - 1]]
        if (!currentBookmark.children) {
            currentBookmark.children = []
        }
        currentBookmark.children.push({ title: 'Nuevo submarcador', page: bookmark.page || 1 })
        setBookmarks(newBookmarks)
    }

    return (
        <div style={{ marginLeft: depth * 16 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem',
                background: 'hsl(var(--muted))',
                borderRadius: '4px',
                fontSize: '0.8rem'
            }}>
                {bookmark.children && bookmark.children.length > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'hsl(var(--foreground))' }}
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}

                {isEditing ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <input
                            type="text"
                            value={bookmark.title}
                            onChange={(e) => updateBookmark({ title: e.target.value })}
                            placeholder="Título"
                            style={{ padding: '0.25rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '3px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                        />
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <input
                                type="number"
                                value={bookmark.page || 1}
                                onChange={(e) => updateBookmark({ page: parseInt(e.target.value) || 1 })}
                                placeholder="Página"
                                min="1"
                                style={{ width: '60px', padding: '0.25rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '3px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                            <input
                                type="text"
                                value={bookmark.dest || ''}
                                onChange={(e) => updateBookmark({ dest: e.target.value || undefined })}
                                placeholder="Dest ID"
                                style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '3px', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            />
                        </div>
                        <button
                            onClick={() => setIsEditing(false)}
                            style={{ padding: '0.25rem', fontSize: '0.7rem', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                            Listo
                        </button>
                    </div>
                ) : (
                    <>
                        <span style={{ flex: 1, color: 'hsl(var(--foreground))' }}>
                            {bookmark.title}
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                                (p.{bookmark.page}{bookmark.dest ? ` → #${bookmark.dest}` : ''})
                            </span>
                        </span>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem', fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={addChild}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem', fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}
                            title="Añadir subelemento"
                        >
                            +
                        </button>
                        <button
                            onClick={deleteBookmark}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem', fontSize: '0.7rem', color: 'hsl(var(--destructive))' }}
                            title="Eliminar"
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>

            {isExpanded && bookmark.children && bookmark.children.length > 0 && (
                <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {bookmark.children.map((child, childIdx) => (
                        <BookmarkItem
                            key={childIdx}
                            bookmark={child}
                            index={childIdx}
                            depth={depth + 1}
                            bookmarks={bookmarks}
                            setBookmarks={setBookmarks}
                            parentPath={path}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
