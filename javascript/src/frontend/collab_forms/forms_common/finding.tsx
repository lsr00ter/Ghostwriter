import { HocuspocusProvider } from "@hocuspocus/provider";
import { Editor } from "@tiptap/core";

import { ConnectionStatus } from "../connection";
import { NumberInput, PlainTextInput } from "../plain_editors/input";
import { TagEditor } from "../plain_editors/tag_editor";
import RichTextEditor from "../rich_text_editor";
import ExtraFieldsSection from "../extra_fields";
import Dropdown from "../plain_editors/dropdown";
import { gql } from "../../../__generated__";
import {
    Get_Finding_TypesQuery,
    Get_SeveritiesQuery,
} from "../../../__generated__/graphql";
import CvssCalculator from "../plain_editors/cvss";

import { t } from "../../i18n";

const GET_FINDING_TYPES = gql(`
    query GET_FINDING_TYPES {
        findingType(order_by:[{id: asc}]) {
            id, findingType
        }
    }
`);
function convertFindingTypes(data: Get_Finding_TypesQuery): [number, string][] {
    return data.findingType.map((t) => [t.id, t.findingType]);
}

const GET_SEVERITIES = gql(`
    query GET_SEVERITIES {
        findingSeverity(order_by:[{id: asc}]) {
            id, severity
        }
    }
`);
function convertSeverities(data: Get_SeveritiesQuery): [number, string][] {
    return data.findingSeverity.map((t) => [t.id, t.severity]);
}

const EMPTY = {};

export function FindingFormFields({
    provider,
    status,
    connected,
    toolbarExtra,
    extraTop,
    extraBottom,
    setEditing,
}: {
    provider: HocuspocusProvider;
    status: ConnectionStatus;
    connected: boolean;
    toolbarExtra?: (editor: Editor) => React.ReactNode;
    extraTop?: React.ReactNode;
    extraBottom?: React.ReactNode;
    setEditing?: (editing: boolean) => void;
}) {
    return (
        <>
            <ConnectionStatus status={status} />

            <h4 className="icon search-icon">{t("finding.categorization", "Categorization")}</h4>
            <hr />

            <div className="form-row">
                <div className="form-group col-md-6 mb-0">
                    <div className="form-group">
                        <label htmlFor="id_title">{t("common.title", "Title")}</label>
                        <div>
                            <PlainTextInput
                                inputProps={{
                                    id: "id_title",
                                    className: "form-control",
                                }}
                                connected={connected}
                                provider={provider}
                                mapKey="title"
                                setEditing={setEditing}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group col-md-6 mb-0">
                    <div className="form-group">
                        <label htmlFor="id_tags">{t("common.tags", "Tags")}</label>
                        <div>
                            <TagEditor
                                id="id_tags"
                                className="form-control"
                                connected={connected}
                                provider={provider}
                                docKey="tags"
                            />
                            <small className="form-text text-muted">
                                {t(
                                    "common.separateTags",
                                    "Separate tags with commas"
                                )}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group col-md-6 mb-0">
                    <div className="form-group">
                        <label htmlFor="collab-form-finding-type">
                            {t("finding.findingType", "Finding Type")}
                        </label>
                        <div>
                            <Dropdown
                                id="collab-form-finding-type"
                                className="select custom-select"
                                provider={provider}
                                mapKey="findingTypeId"
                                optionsQuery={GET_FINDING_TYPES}
                                optionsVars={EMPTY}
                                convertOptions={convertFindingTypes}
                                connected={connected}
                            />
                            <small className="form-text text-muted">
                                {t(
                                    "finding.findingTypeHelp",
                                    "Select a finding category that fits"
                                )}
                            </small>
                        </div>
                    </div>
                </div>

                <div className="form-group col-md-6 mb-0">
                    <div className="form-group">
                        <label htmlFor="collab-form-severity">{t("finding.severity", "Severity")}</label>
                        <div>
                            <Dropdown
                                id="collab-form-severity"
                                className="select custom-select"
                                provider={provider}
                                mapKey="severityId"
                                connected={connected}
                                optionsQuery={GET_SEVERITIES}
                                optionsVars={EMPTY}
                                convertOptions={convertSeverities}
                            />
                            <small className="form-text text-muted">
                                {t(
                                    "finding.severityHelp",
                                    "Select a severity rating for this finding that reflects its role in a system compromise"
                                )}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group col-md-6 mb-0">
                    <label htmlFor="collab-form-cvss-score">{t("finding.cvssScore", "CVSS Score")}</label>
                    <div>
                        <NumberInput
                            inputProps={{
                                id: "collab-form-cvss-score",
                                className: "form-control numberinput",
                            }}
                            provider={provider}
                            mapKey="cvssScore"
                            connected={connected}
                            defaultValue={null}
                            setEditing={setEditing}
                        />
                        <small className="form-text text-muted">
                            {t(
                                "finding.cvssScoreHelp",
                                "Set the CVSS score for this finding"
                            )}
                        </small>
                    </div>
                </div>

                <div className="form-group col-md-6 mb-0">
                    <label htmlFor="collab-form-cvss-vector">{t("finding.cvssVector", "CVSS Vector")}</label>
                    <div>
                        <PlainTextInput
                            inputProps={{
                                id: "collab-form-cvss-vector",
                                className: "form-control numberinput",
                                maxLength: 255,
                            }}
                            connected={connected}
                            provider={provider}
                            mapKey="cvssVector"
                            setEditing={setEditing}
                        />
                        <small className="form-text text-muted">
                            {t(
                                "finding.cvssVectorHelp",
                                "Set the CVSS vector for this finding"
                            )}
                        </small>
                    </div>
                </div>
            </div>

            <CvssCalculator
                provider={provider}
                connected={connected}
                vectorKey="cvssVector"
                scoreKey="cvssScore"
                severityKey="severityId"
            />

            {extraTop}

            <h4 className="icon pencil-icon">{t("finding.generalInformation", "General Information")}</h4>
            <hr />

            <div className="form-group col-md-12">
                <label>{t("common.description", "Description")}</label>
                <div>
                    <RichTextEditor
                        provider={provider}
                        connected={connected}
                        fragment={provider.document.getXmlFragment(
                            "description"
                        )}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            <div className="form-group col-md-12">
                <label>{t("finding.impact", "Impact")}</label>
                <div>
                    <RichTextEditor
                        connected={connected}
                        provider={provider}
                        fragment={provider.document.getXmlFragment("impact")}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            <h4 className="icon shield-icon">{t("finding.defense", "Defense")}</h4>
            <hr />

            <div className="form-group col-md-12">
                <label>{t("finding.mitigation", "Mitigation")}</label>
                <div>
                    <RichTextEditor
                        connected={connected}
                        provider={provider}
                        fragment={provider.document.getXmlFragment(
                            "mitigation"
                        )}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            <div className="form-group col-md-12">
                <label>{t("finding.replicationSteps", "Replication Steps")}</label>
                <div>
                    <RichTextEditor
                        connected={connected}
                        provider={provider}
                        fragment={provider.document.getXmlFragment(
                            "replicationSteps"
                        )}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            <div className="form-group col-md-12">
                <label>{t("finding.hostDetectionTechniques", "Host Detection Techniques")}</label>
                <div>
                    <RichTextEditor
                        connected={connected}
                        provider={provider}
                        fragment={provider.document.getXmlFragment(
                            "hostDetectionTechniques"
                        )}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            <div className="form-group col-md-12">
                <label>{t("finding.networkDetectionTechniques", "Network Detection Techniques")}</label>
                <div>
                    <RichTextEditor
                        connected={connected}
                        provider={provider}
                        fragment={provider.document.getXmlFragment(
                            "networkDetectionTechniques"
                        )}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            <h4 className="icon link-icon">{t("finding.referenceLinks", "Reference Links")}</h4>
            <hr />

            <div className="form-group col-md-12">
                <label>{t("finding.references", "References")}</label>
                <div>
                    <RichTextEditor
                        connected={connected}
                        provider={provider}
                        fragment={provider.document.getXmlFragment(
                            "references"
                        )}
                        toolbarExtra={toolbarExtra}
                    />
                </div>
            </div>

            {extraBottom}

            <ExtraFieldsSection
                connected={connected}
                provider={provider}
                header={
                    <>
                        <h4 className="icon link-icon">{t("finding.extraFields", "Extra Fields")}</h4>
                        <hr />
                    </>
                }
                toolbarExtra={toolbarExtra}
                setEditing={setEditing}
            />
        </>
    );
}
