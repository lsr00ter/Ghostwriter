Translations
============

Ghostwriter uses Django's ``gettext`` framework for the web UI. Translation
catalogs live in ``locale/<lang>/LC_MESSAGES/django.po``. Currently shipped
locales:

* ``en`` — source strings (no catalog file required).
* ``zh_Hans`` — Simplified Chinese.

Per-user language is stored on ``UserProfile.language_preference``; the
``UserLanguageMiddleware`` activates it for each request after Django's
``LocaleMiddleware`` runs.

Marking strings for translation
-------------------------------

Templates::

    {% load i18n %}
    {% trans "Save" %}
    {% blocktrans with name=user.username %}Welcome, {{ name }}!{% endblocktrans %}

Python (models, forms, choices, validators)::

    from django.utils.translation import gettext_lazy as _

    class Meta:
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")

Python (views, ``messages`` framework, runtime strings)::

    from django.utils.translation import gettext as _

    messages.success(request, _("Domain successfully deleted."))

Notes
~~~~~

* Strings inside Python ``HTML(...)`` literals consumed by ``crispy-forms``
  are *not* extracted via ``{% trans %}``. Wrap the string with ``_()`` in
  Python and concatenate, or move the markup into a template fragment.
* Avoid Unicode characters in Python and template source files; place
  Chinese only inside ``django.po`` ``msgstr`` values.

Extracting messages
-------------------

Run inside the Django container so paths resolve to ``/app``::

    docker exec ghostwriter-django-1 \
        python manage.py makemessages -l zh_Hans \
            -i node_modules -i .venv -i staticfiles -i tests

The command rewrites ``locale/zh_Hans/LC_MESSAGES/django.po`` in place,
preserving existing translations by ``msgid`` match. New strings appear with
empty ``msgstr ""`` values; obsolete entries are kept under ``#~`` until
removed manually.

Translating
-----------

Edit ``locale/zh_Hans/LC_MESSAGES/django.po`` and fill in each ``msgstr``.
Resolve any ``#, fuzzy`` markers by correcting the suggestion and removing
the marker; fuzzy entries are ignored at runtime.

Compiling
---------

Generate the binary catalog (ignored by git, regenerated per environment)::

    docker exec ghostwriter-django-1 \
        python manage.py compilemessages -l zh_Hans

Reload the running Django process so the new catalog is picked up::

    docker restart ghostwriter-django-1

Verifying
---------

Inspect translation coverage::

    msgfmt --statistics -o /dev/null \
        locale/zh_Hans/LC_MESSAGES/django.po

Set ``UserProfile.language_preference = "zh-hans"`` on a test user, log in,
and walk the affected pages. Compare against the same flow as a user with
``language_preference = "en"`` to confirm no regression.
