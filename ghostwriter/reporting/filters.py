"""This contains all the model filters used by the Reporting application."""

# Django Imports
from django import forms
from django.forms.widgets import TextInput
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _

# 3rd Party Libraries
import django_filters
from crispy_forms.bootstrap import (
    Accordion,
    AccordionGroup,
    InlineCheckboxes,
    PrependedText,
)
from crispy_forms.helper import FormHelper
from crispy_forms.layout import HTML, ButtonHolder, Column, Div, Layout, Row, Submit

# Ghostwriter Libraries
from ghostwriter.modules.custom_layout_object import SwitchToggle
from ghostwriter.modules.shared import search_tags
from ghostwriter.reporting.models import (
    Archive,
    Finding,
    FindingType,
    Observation,
    Report,
    ReportTemplate,
    Severity,
)


class FindingFilter(django_filters.FilterSet):
    """
    Filter :model:`reporting.Finding` model for searching.

    **Fields**

    ``title``
        Case insensitive search of the title field contents.
    ``severity``
        Checkbox choice filter using :model:`reporting.Severity`.
    ``finding_type``
        Multiple choice filter using :model:`reporting.FindingType`.
    ``tags``
        Search of the tags field contents.
     ``on_reports``
        Boolean field to filter findings on reports.
     ``not_cloned``
        Boolean field to filter findings on reports and not in the library.
    """

    title = django_filters.CharFilter(
        lookup_expr="icontains",
        label=_("Finding Title Contains"),
        widget=TextInput(
            attrs={"placeholder": _("Partial Finding Title"), "autocomplete": "off"}
        ),
    )
    severity = django_filters.ModelMultipleChoiceFilter(
        queryset=Severity.objects.all().order_by("weight"),
        widget=forms.CheckboxSelectMultiple,
        label="",
    )
    finding_type = django_filters.ModelMultipleChoiceFilter(
        queryset=FindingType.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        label="",
    )
    tags = django_filters.CharFilter(
        method="search_tags",
        label=_("Finding Tags Contain"),
        widget=TextInput(
            attrs={
                "placeholder": _("Finding Tag"),
                "autocomplete": "off",
            }
        ),
    )

    # Dummy filter to add a checkbox onto the form, which the view uses to select Findings vs ReportFindingLinks
    on_reports = django_filters.BooleanFilter(
        method="filter_on_reports",
        label=_("Search findings on reports"),
        widget=forms.CheckboxInput,
    )
    not_cloned = django_filters.BooleanFilter(
        method="filter_on_library",
        label=_("Return only findings on reports that started as blank findings"),
        widget=forms.CheckboxInput,
    )

    def filter_on_reports(self, queryset, *args, **kwargs):
        return queryset

    def filter_on_library(self, queryset, *args, **kwargs):
        return queryset

    class Meta:
        model = Finding
        fields = ["title", "severity", "finding_type"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "get"

        # Determine active state from session (default to False if not available)
        is_active = False
        if self.request and hasattr(self.request, "session"):
            filter_data = self.request.session.get("filter", {})
            is_active = filter_data.get("sticky", False)

        # Layout the form for Bootstrap
        self.helper.layout = Layout(
            Accordion(
                AccordionGroup(
                    _("Finding Filters"),
                    Div(
                        Row(
                            Column(
                                PrependedText("title", '<i class="fas fa-filter"></i>'),
                                css_class="col-md-4 offset-md-2 mb-0",
                            ),
                            Column(
                                PrependedText("tags", '<i class="fas fa-tag"></i>'),
                                css_class="col-md-4 mb-0",
                            ),
                            css_class="form-row",
                        ),
                        Row(
                            Column(
                                InlineCheckboxes("severity"),
                                css_class="col-md-12 m-1",
                            ),
                            css_class="form-row",
                        ),
                        Row(
                            Column(
                                InlineCheckboxes("finding_type"),
                                css_class="col-md-12 m-1",
                            ),
                            css_class="form-row",
                        ),
                        Row(
                            Column(
                                "on_reports",
                                css_class="col-md-12 m-1 tooltip-label-only",
                                data_tooltip_text=_(
                                    "Return results from reports instead of the library"
                                ),
                            ),
                            css_class="form-row",
                        ),
                        Row(
                            Column(
                                "not_cloned",
                                css_class="col-md-12 m-1 tooltip-label-only",
                                data_tooltip_text=_(
                                    "Return only findings attached to reports and not in the library (based on title)"
                                ),
                            ),
                            css_class="form-row",
                        ),
                        ButtonHolder(
                            Submit("submit_btn", _("Filter"), css_class="col-1"),
                            HTML(
                                format_lazy(
                                    '<a class="btn btn-outline-secondary col-1" role="button"'
                                    " href=\"{{% url 'reporting:findings' %}}\">{label}</a>",
                                    label=_("Reset"),
                                )
                            ),
                            css_class="mt-2",
                        ),
                    ),
                    active=is_active,
                    template="accordion_group.html",
                ),
                css_class="justify-content-center",
            ),
        )

    def search_tags(self, queryset, name, value):
        """Filter findings by tags."""
        return search_tags(queryset, value)


class ObservationFilter(django_filters.FilterSet):
    """
    Filter :model:`reporting.Observation` model for searching.

    **Fields**

    ``title``
        Case insensitive search of the title field contents.
    """

    title = django_filters.CharFilter(
        lookup_expr="icontains",
        label=_("Observation Title Contains"),
        widget=TextInput(
            attrs={
                "placeholder": _("Observation Title Contains"),
                "autocomplete": "off",
            }
        ),
    )
    tags = django_filters.CharFilter(
        method="search_tags",
        label=_("Observation Tags Contain"),
        widget=TextInput(
            attrs={
                "placeholder": _("Observation Tag"),
                "autocomplete": "off",
            }
        ),
    )

    class Meta:
        model = Observation
        fields = ["title"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "get"
        self.helper.form_id = "observations-filter-form"

        # Determine active state from session (default to False if not available)
        is_active = False
        if self.request and hasattr(self.request, "session"):
            filter_data = self.request.session.get("filter", {})
            is_active = filter_data.get("sticky", False)

        self.helper.layout = Layout(
            Accordion(
                AccordionGroup(
                    _("Observation Filters"),
                    Div(
                        Row(
                            Column(
                                PrependedText("title", '<i class="fas fa-filter"></i>'),
                                css_class="col-md-4 offset-md-2 mb-0",
                            ),
                            Column(
                                PrependedText("tags", '<i class="fas fa-tag"></i>'),
                                css_class="col-md-4 mb-0",
                            ),
                            css_class="form-row",
                        ),
                        ButtonHolder(
                            Submit("submit_btn", _("Filter"), css_class="col-1"),
                            HTML(
                                format_lazy(
                                    '<a class="btn btn-outline-secondary col-1" role="button"'
                                    " href=\"{{% url 'reporting:observations' %}}\">{label}</a>",
                                    label=_("Reset"),
                                )
                            ),
                            css_class="mt-3",
                        ),
                    ),
                    active=is_active,
                    template="accordion_group.html",
                ),
                css_class="justify-content-center",
            ),
        )

    def search_tags(self, queryset, name, value):
        """Filter observation by tags."""
        return search_tags(queryset, value)


class ReportFilter(django_filters.FilterSet):
    """
    Filter :model:`reporting.Report` model for searching.

    **Fields**

    ``title``
        Case insensitive search of the title field contents.
    ``tags``
        Search of the tags field contents.
    ``complete``
        Boolean field to filter completed reports.
    """

    title = django_filters.CharFilter(
        lookup_expr="icontains",
        label=_("Report Title Contains"),
        widget=TextInput(
            attrs={"placeholder": _("Partial Report Title"), "autocomplete": "off"}
        ),
    )
    tags = django_filters.CharFilter(
        method="search_tags",
        label=_("Report Tags Contain"),
        widget=TextInput(
            attrs={
                "placeholder": _("Report Tag"),
                "autocomplete": "off",
            }
        ),
    )

    STATUS_CHOICES = (
        (0, _("Incomplete Reports")),
        (1, _("Completed")),
    )

    exclude_archived = django_filters.BooleanFilter(
        label=_("Filter Archived"),
        method="filter_archived",
        widget=forms.CheckboxInput,
    )

    complete = django_filters.ChoiceFilter(
        choices=STATUS_CHOICES, empty_label=None, label=_("Report Status")
    )

    class Meta:
        model = Report
        fields = ["title", "complete"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "get"

        # Determine active state from session (default to False if not available)
        is_active = False
        if self.request and hasattr(self.request, "session"):
            filter_data = self.request.session.get("filter", {})
            is_active = filter_data.get("sticky", False)

        # Layout the form for Bootstrap
        self.helper.layout = Layout(
            Accordion(
                AccordionGroup(
                    _("Report Filters"),
                    Div(
                        Row(
                            Column(
                                PrependedText("title", '<i class="fas fa-filter"></i>'),
                                css_class="col-md-4",
                            ),
                            Column(
                                PrependedText("tags", '<i class="fas fa-tag"></i>'),
                                css_class="col-md-4 mb-0",
                            ),
                            Column(
                                PrependedText(
                                    "complete",
                                    '<i class="fas fa-toggle-on"></i>',
                                ),
                                css_class="col-md-4 mb-0",
                            ),
                            css_class="form-row",
                        ),
                        Row(
                            Column(
                                SwitchToggle("exclude_archived"),
                            ),
                            css_class="form-row",
                        ),
                        ButtonHolder(
                            Submit(
                                "submit_btn",
                                _("Filter"),
                                css_class="btn btn-primary col-1",
                            ),
                            HTML(
                                format_lazy(
                                    '<a class="btn btn-outline-secondary col-1" role="button"'
                                    " href=\"{{% url 'reporting:reports' %}}\">{label}</a>",
                                    label=_("Reset"),
                                )
                            ),
                            css_class="mt-3",
                        ),
                    ),
                    active=is_active,
                    template="accordion_group.html",
                ),
                css_class="justify-content-center",
            ),
        )

    def search_tags(self, queryset, name, value):
        """Filter reports by tags."""
        return search_tags(queryset, value)

    def filter_archived(self, queryset, name, value):
        """
        Choose to include or exclude archived reports in search results.
        """
        if value:
            return queryset.filter(archived=False)
        return queryset


class ArchiveFilter(django_filters.FilterSet):
    """
    Filter :model:`reporting.Report` model for searching.

    **Fields**

    ``client``
        Case insensitive search of the client field and associated :model:`rolodex.Client`.
    """

    client = django_filters.CharFilter(
        field_name="project__client__name",
        label=_("Client Name Contains"),
        lookup_expr="icontains",
        widget=TextInput(
            attrs={"placeholder": _("Partial Client Name"), "autocomplete": "off"}
        ),
    )

    class Meta:
        model = Archive
        fields = ["project__client"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "get"
        # Layout the form for Bootstrap
        self.helper.layout = Layout(
            Accordion(
                AccordionGroup(
                    _("Archive Filters"),
                    Div(
                        Row(
                            Column(
                                PrependedText(
                                    "client", '<i class="fas fa-filter"></i>'
                                ),
                                css_class="col-md-4 offset-md-4 mb-0",
                            ),
                        ),
                        ButtonHolder(
                            Submit(
                                "submit_btn",
                                _("Filter"),
                                css_class="btn btn-primary col-1",
                            ),
                            HTML(
                                format_lazy(
                                    '<a class="btn btn-outline-secondary col-1" role="button"'
                                    " href=\"{{% url 'reporting:archived_reports' %}}\">{label}</a>",
                                    label=_("Reset"),
                                )
                            ),
                            css_class="mt-3",
                        ),
                    ),
                    active=False,
                    template="accordion_group.html",
                ),
                css_class="justify-content-center",
            ),
        )


class ReportTemplateFilter(django_filters.FilterSet):
    """
    Filter :model:`reporting.ReportTemplate` model for searching.

    **Fields**

    ``name``
        Case insensitive search of the name field contents.
    ``doc_type``
        Multiple choice filter using :model:`reporting.DocType`.
    ``tags``
        Search of the tags field contents.
    ``protected``
        Boolean field to filter protected report templates.
    """

    name = django_filters.CharFilter(
        lookup_expr="icontains",
        label=_("Report Title Contains"),
        widget=TextInput(
            attrs={"placeholder": _("Partial Template Title"), "autocomplete": "off"}
        ),
    )
    client = django_filters.CharFilter(
        field_name="client__name",
        label=_("Client Name Contains"),
        lookup_expr="icontains",
        widget=TextInput(
            attrs={"placeholder": _("Partial Client Name"), "autocomplete": "off"}
        ),
    )
    tags = django_filters.CharFilter(
        method="search_tags",
        label=_("Template Tags Contain"),
        widget=TextInput(
            attrs={
                "placeholder": _("Template Tag"),
                "autocomplete": "off",
            }
        ),
    )

    DOC_TYPE_CHOICES = (
        (1, "DOCX"),
        (2, "PPTX"),
    )

    doc_type = django_filters.ChoiceFilter(
        choices=DOC_TYPE_CHOICES,
        empty_label=_("All Templates"),
        label=_("Document Type"),
    )

    PROTECTED_CHOICES = (
        (0, _("Not Protected")),
        (1, _("Protected")),
    )

    protected = django_filters.ChoiceFilter(
        choices=PROTECTED_CHOICES,
        empty_label=_("All Projects"),
        label=_("Project Status"),
    )

    class Meta:
        model = ReportTemplate
        fields = ["name", "doc_type", "protected"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = "get"

        # Determine active state from session (default to False if not available)
        is_active = False
        if self.request and hasattr(self.request, "session"):
            filter_data = self.request.session.get("filter", {})
            is_active = filter_data.get("sticky", False)

        # Layout the form for Bootstrap
        self.helper.layout = Layout(
            Accordion(
                AccordionGroup(
                    _("Report Template Filters"),
                    Div(
                        Row(
                            Column(
                                PrependedText("name", '<i class="fas fa-filter"></i>'),
                                css_class="col-md-6",
                            ),
                            Column(
                                PrependedText(
                                    "doc_type",
                                    '<i class="fas fa-file-alt"></i>',
                                ),
                                css_class="col-md-6 mb-0",
                            ),
                            css_class="form-row",
                        ),
                        Row(
                            Column(
                                PrependedText(
                                    "client", '<i class="fas fa-filter"></i>'
                                ),
                                css_class="col-md-6",
                            ),
                            Column(
                                PrependedText("tags", '<i class="fas fa-tag"></i>'),
                                css_class="col-md-6 mb-0",
                            ),
                            css_class="form-row",
                        ),
                        ButtonHolder(
                            Submit(
                                "submit_btn",
                                _("Filter"),
                                css_class="btn btn-primary col-1",
                            ),
                            HTML(
                                format_lazy(
                                    '<a class="btn btn-outline-secondary col-1" role="button"'
                                    " href=\"{{% url 'reporting:templates' %}}\">{label}</a>",
                                    label=_("Reset"),
                                )
                            ),
                            css_class="mt-3",
                        ),
                    ),
                    active=is_active,
                    template="accordion_group.html",
                ),
                css_class="justify-content-center",
            ),
        )

    def search_tags(self, queryset, name, value):
        """Filter report templates by tags."""
        return search_tags(queryset, value)
