import React from 'react';

const ShortcutsHint: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Raccourcis Clavier</h3>
            <ul className="text-sm text-gray-600 space-y-1">
                <li>• Appuyez sur <strong>ESPACE</strong> pour synchroniser la ligne actuelle</li>
                <li>• Cliquez sur une ligne pour la sélectionner</li>
            </ul>
        </div>
    );
};

export default ShortcutsHint;