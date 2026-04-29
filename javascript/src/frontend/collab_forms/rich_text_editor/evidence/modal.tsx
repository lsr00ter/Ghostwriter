import { useContext, useId, useState } from "react";
import ReactModal from "react-modal";
import { EvidencesContext } from "../../../../tiptap_gw/evidence";
import { Editor } from "@tiptap/react";
import EvidenceUploadForm from "./upload";

import { t } from "../../../i18n";

export default function EvidenceModal(props: {
    editor: Editor;
    initialId: null | number;
    initialFile?: File;
    setEvidenceId: (id: number | null) => void;
}) {
    const [uploadMode, setUploadMode] = useState<boolean>(
        props.initialFile != null
    );

    let content;
    if (uploadMode) {
        content = (
            <EvidenceUploadForm
                initialFile={props.initialFile}
                switchMode={() => setUploadMode(false)}
                onSubmit={props.setEvidenceId}
            />
        );
    } else {
        content = (
            <EvidenceSelectForm
                initial={props.initialId}
                switchMode={() => setUploadMode(true)}
                onSubmit={props.setEvidenceId}
            />
        );
    }

    return (
        <ReactModal
            isOpen
            onRequestClose={() => props.setEvidenceId(null)}
            contentLabel={t("evidence.insert", "Insert Evidence")}
            className="modal-dialog modal-dialog-centered"
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">
                        {props.initialId === null
                            ? t("evidence.insert", "Insert Evidence")
                            : t("evidence.edit", "Edit Evidence")}
                    </h5>
                </div>
                {content}
            </div>
        </ReactModal>
    );
}

function EvidenceSelectForm(props: {
    initial: number | null;
    onSubmit: (id: number | null) => void;
    switchMode: () => void;
}) {
    const evidences = useContext(EvidencesContext);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const nameId = useId();
    return (
        <>
            <div className="modal-body">
                <div className="form-group">
                    <label htmlFor={nameId}>
                        {t("evidence.name", "Evidence Name")}
                    </label>
                    <select
                        className="custom-select custom-select-lg"
                        value={selectedId?.toString()}
                        onChange={(e) =>
                            setSelectedId(
                                e.target.value === ""
                                    ? null
                                    : parseInt(e.target.value)
                            )
                        }
                    >
                        <option value="">
                            {t("evidence.select", "Select Evidence...")}
                        </option>
                        {evidences?.evidence?.map((e) => (
                            <option value={e.id} key={e.id}>
                                {e.friendlyName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="modal-footer">
                <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                        e.preventDefault();
                        props.switchMode();
                    }}
                >
                    {t("evidence.uploadNew", "Upload New")}
                </button>
                <button
                    className="btn btn-primary"
                    disabled={selectedId === null}
                    onClick={(e) => {
                        e.preventDefault();
                        props.onSubmit(selectedId);
                    }}
                >
                    {props.initial === null
                        ? t("common.insert", "Insert")
                        : t("common.save", "Save")}
                </button>
                <button
                    className="btn btn-secondary-outline"
                    onClick={(e) => {
                        e.preventDefault();
                        props.onSubmit(null);
                    }}
                >
                    {t("common.cancel", "Cancel")}
                </button>
            </div>
        </>
    );
}
