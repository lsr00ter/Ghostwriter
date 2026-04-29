import { useId, useState } from "react";
import ReactModal from "react-modal";
import { Editor, useEditorState } from "@tiptap/react";
import { MenuItem } from "@szhsin/react-menu";
import { GwTableCell, TableCaption } from "../../../tiptap_gw/table";
import { ColorModal, ColorModalMode } from "./color";

import { t } from "../../i18n";

export function TableCaptionBookmarkButton({ editor }: { editor: Editor }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [bookmark, setBookmark] = useState("");
    const fieldId = useId();

    const enabled = useEditorState({
        editor,
        selector: ({ editor }) => {
            if (!editor.isInitialized) return false;
            return editor.can().setTableCaptionBookmark("example");
        },
    });

    return (
        <>
            <MenuItem
                title={t("editor.captionBookmark", "Caption Bookmark")}
                disabled={!enabled}
                onClick={() => {
                    setBookmark(
                        editor.getAttributes(TableCaption.name).bookmark || ""
                    );
                    setModalOpen(true);
                }}
            >
                {t("editor.setBookmark", "Set Bookmark")}
            </MenuItem>
            <ReactModal
                isOpen={modalOpen}
                onRequestClose={() => setModalOpen(false)}
                contentLabel={t(
                    "editor.editCaptionBookmark",
                    "Edit Caption Bookmark"
                )}
                className="modal-dialog modal-dialog-centered"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {t(
                                "editor.editCaptionBookmark",
                                "Edit Caption Bookmark"
                            )}
                        </h5>
                    </div>
                    <div className="modal-body text-center">
                        <div className="form-group">
                            <label htmlFor={fieldId}>
                                {t("editor.bookmarkName", "Bookmark Name")}
                            </label>
                            <input
                                id={fieldId}
                                type="text"
                                className="form-control"
                                value={bookmark}
                                onChange={(e) => setBookmark(e.target.value)}
                            />
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const trimmedId = bookmark.trim();
                                    editor
                                        .chain()
                                        .setTableCaptionBookmark(
                                            trimmedId === ""
                                                ? undefined
                                                : trimmedId
                                        )
                                        .run();
                                    setModalOpen(false);
                                }}
                            >
                                {t("common.save", "Save")}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setModalOpen(false);
                                }}
                            >
                                {t("common.cancel", "Cancel")}
                            </button>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </>
    );
}

export function TableCellBackgroundColor({ editor }: { editor: Editor }) {
    const [modalMode, setModalMode] = useState<ColorModalMode>(null);
    const [formColor, setFormColor] = useState<string>("#f00");

    const enabled = editor.can().setTableCellBackgroundColor(null);

    return (
        <>
            <MenuItem
                title={t("editor.cellBackground", "Cell Background")}
                disabled={!enabled}
                onClick={(e) => {
                    const current =
                        editor.getAttributes(GwTableCell.name).bgColor || "";
                    setFormColor(current);
                    setModalMode("edit");
                }}
            >
                {t("editor.cellBackground", "Cell Background")}
            </MenuItem>
            <ColorModal
                modalMode={modalMode}
                setModalMode={setModalMode}
                formColor={formColor}
                setFormColor={setFormColor}
                setColor={() => {
                    if (formColor)
                        editor
                            .chain()
                            .setTableCellBackgroundColor(formColor || null)
                            .run();
                }}
                removeColor={() => {
                    editor.chain().setTableCellBackgroundColor(null).run();
                }}
            />
        </>
    );
}
