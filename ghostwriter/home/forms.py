"""This contains all the forms used by the Home application."""

# Django Imports
from django import forms
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

# 3rd Party Libraries
from crispy_forms.helper import FormHelper
from crispy_forms.layout import HTML, ButtonHolder, Column, Layout, Row, Submit

# Ghostwriter Libraries
from ghostwriter.home.models import UserProfile


class UserProfileForm(forms.ModelForm):
    """Update avatar and interface preferences for an individual :model:`home.UserProfile`."""

    class Meta:
        model = UserProfile
        exclude = ("user", "hide_quickstart")
        widgets = {
            "avatar": forms.FileInput(attrs={"class": "custom-file-input"}),
            "language_preference": forms.Select(attrs={"class": "custom-select"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["avatar"].label = ""
        self.fields["language_preference"].label = _("Web Interface Language")
        self.fields["language_preference"].help_text = _(
            "Set the default language for the web interface."
        )
        self.helper = FormHelper()
        self.helper.form_method = "post"
        self.helper.attrs = {"enctype": "multipart/form-data"}
        self.helper.layout = Layout(
            HTML(
                """
                {% load i18n %}
                <h4 class="icon avatar-upload-icon">{% trans "Avatar Upload" %}</h4>
                <hr>
                <div class="offset-md-2 col-md-8 text-justify">
                    <p>{% blocktrans %}Your avatar will be displayed as a circle and automatically cropped to fit. For best results,
                    upload a square image (equal height and width) or ensure your face is centered in the image.{% endblocktrans %}</p>
                    <p>{% trans "Previews for images will appear below." %}</p>
                </div>
                <div id="avatarPreview" class="pb-3"></div>
                """
            ),
            Row(
                Column(
                    HTML(
                        """
                        {% load i18n %}
                        {% if form.avatar.errors %}<div class="invalid-feedback d-block">{{ form.avatar.errors }}</div>{% endif %}
                        <div class="custom-file">
                            {{ form.avatar }}
                            <label class="custom-file-label" for="id_avatar" id="filename">
                                {% trans "Click here or drag and drop..." %}</label>
                            <script type="text/javascript" id="script-id_avatar">
                                (function() {
                                    var input = document.getElementById("id_avatar");
                                    var label = document.getElementById("filename");
                                    var placeholder = label.textContent;
                                    if (!input) { console.error("Avatar file input #id_avatar not found"); return; }
                                    input.addEventListener("change", function(e) {
                                        if (e.target.files.length === 0) {
                                            label.textContent = placeholder;
                                        } else {
                                            var filenames = "";
                                            for (var i = 0; i < e.target.files.length; i++) {
                                                filenames += (i > 0 ? ", " : "") + e.target.files[i].name;
                                            }
                                            label.textContent = filenames;
                                        }
                                    });
                                })();
                            </script>
                        </div>
                        """
                    ),
                    css_class="col-8 offset-md-2",
                )
            ),
            HTML(
                """
                {% load i18n %}
                <h4 class="icon globe-icon">{% trans "Interface Preferences" %}</h4>
                <hr>
                """
            ),
            Row(
                Column(
                    "language_preference",
                    css_class="form-group col-md-8 offset-md-2 mb-0",
                )
            ),
            ButtonHolder(
                Submit("submit", _("Submit"), css_class="btn btn-primary col-md-4"),
                HTML(
                    """
                    {% load i18n %}
                    <button onclick="window.location.href='{{ cancel_link }}'"
                    class="btn btn-outline-secondary col-md-4" type="button">{% trans "Cancel" %}</button>
                    """
                ),
                css_class="mt-3"
            ),
        )


class SignupForm(forms.ModelForm):
    """Create a new :model:`users.User`."""

    class Meta:
        model = get_user_model()
        fields = [
            "name",
        ]

    def signup(self, request, user):  # pragma: no cover
        user.name = self.cleaned_data["name"]
        user.save()
