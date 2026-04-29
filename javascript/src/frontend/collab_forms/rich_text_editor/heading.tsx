import { useId, useState } from "react";
import { HeadingWithId } from "../../../tiptap_gw/heading";
import ReactModal from "react-modal";
import { Editor, useEditorState } from "@tiptap/react";
import { MenuItem } from "@szhsin/react-menu";

import { t } from "../../i18n";

export default function HeadingIdButton({ editor }: { editor: Editor }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [bookmark, setBookmark] = useState("");
    const fieldId = useId();

    const enabled = useEditorState({
        editor,
        selector: ({ editor }) => {
            if (!editor.isInitialized) return false;
            return editor.can().setHeadingBookmark("example");
        },
    });

    return (
        <>
            <MenuItem
                title={t("editor.headingBookmark", "Heading Bookmark")}
                disabled={!enabled}
                onClick={() => {
                    setBookmark(
                        editor.getAttributes(HeadingWithId.name).bookmark || ""
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
                    "editor.editHeadingBookmark",
                    "Edit Heading Bookmark"
                )}
                className="modal-dialog modal-dialog-centered"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {t(
                                "editor.editHeadingBookmark",
                                "Edit Heading Bookmark"
                            )}
                        </h5>
                    </div>
                    <form
                        className="modal-body text-center"
                        onSubmit={(ev) => {
                            ev.preventDefault();
                            const trimmedId = bookmark.trim();
                            editor
                                .chain()
                                .setHeadingBookmark(
                                    trimmedId === "" ? undefined : trimmedId
                                )
                                .run();
                            setModalOpen(false);
                        }}
                    >
                        <div className="form-group">
                            <label htmlFor={fieldId}>
                                {t("editor.bookmarkName", "Bookmark Name")}
                            </label>
                            <input
                                id={fieldId}
                                type="text"
                                className="form-control"
                                value={bookmark}
                                autoFocus
                                onChange={(e) => setBookmark(e.target.value)}
                            />
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-primary">
                                {t("common.save", "Save")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setModalOpen(false);
                                }}
                            >
                                {t("common.cancel", "Cancel")}
                            </button>
                        </div>
                    </form>
                </div>
            </ReactModal>
        </>
    );
}
