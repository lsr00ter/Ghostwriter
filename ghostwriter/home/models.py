"""This contains all the database models for the Home application."""

# Standard Libraries
import os

# Django Imports
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


WEB_INTERFACE_LANGUAGES = (
    ("en", _("English")),
    ("zh-hans", _("Chinese")),
)


# Create your models here.
class UserProfile(models.Model):
    """Stores an individual user profile form, related to :model:`users.User`."""

    def set_upload_destination(self, filename):
        """
        Set the ``upload_to`` destination to the ``user_avatars`` folder for the
        associated :model:`users.User` entry.
        """
        return os.path.join("images", "user_avatars", str(self.user.id), filename)

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=set_upload_destination, default=None, blank=True)
    hide_quickstart = models.BooleanField(default=False)
    language_preference = models.CharField(
        max_length=7,
        choices=WEB_INTERFACE_LANGUAGES,
        default="en",
        help_text=_("Set the default language for the web interface."),
        verbose_name=_("Web Interface Language"),
    )

    class Meta:

        ordering = ["user"]
        verbose_name = "User profile"
        verbose_name_plural = "User profiles"
