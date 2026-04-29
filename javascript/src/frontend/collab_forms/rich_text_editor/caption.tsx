import { useId, useState } from "react";
import ReactModal from "react-modal";
import { Editor, useEditorState } from "@tiptap/react";
import { MenuItem } from "@szhsin/react-menu";

import { t } from "../../i18n";

export default function CaptionButton({ editor }: { editor: Editor }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [refName, setRefName] = useState("");
    const fieldId = useId();

    const enabled = useEditorState({
        editor,
        selector: ({ editor }) => editor.can().setCaption("refname"),
    });

    return (
        <>
            <MenuItem
                title={t("editor.caption", "Caption")}
                disabled={!enabled}
                onClick={() => {
                    setRefName("");
                    setModalOpen(true);
                }}
            >
                {t("editor.insertCaption", "Insert Caption")}
            </MenuItem>
            <ReactModal
                isOpen={modalOpen}
                onRequestClose={() => setModalOpen(false)}
                contentLabel={t("editor.insertCaption", "Insert Caption")}
                className="modal-dialog modal-dialog-centered"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {t("editor.insertCaption", "Insert Caption")}
                        </h5>
                    </div>
                    <form
                        className="modal-body text-center"
                        onSubmit={(ev) => {
                            ev.preventDefault();
                            editor.chain().setCaption(refName.trim()).run();
                            setModalOpen(false);
                        }}
                    >
                        <div className="form-group">
                            <label htmlFor={fieldId}>
                                {t(
                                    "editor.referenceNameOptional",
                                    "Reference Name (Optional)"
                                )}
                            </label>
                            <input
                                id={fieldId}
                                type="text"
                                className="form-control"
                                value={refName}
                                autoFocus
                                onChange={(e) => setRefName(e.target.value)}
                            />
                            <small className="form-text text-muted">
                                {t(
                                    "editor.captionReferenceHelp",
                                    "If supplied, links can be made to this caption by using a reference name in the report."
                                )}
                            </small>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-primary">
                                {t("common.insert", "Insert")}
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
