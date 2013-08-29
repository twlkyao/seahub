# encoding: utf-8
from django import forms
from django.db import models
from django.forms import ModelForm
from django.utils.translation import ugettext as _

from seaserv import ccnet_threaded_rpc

from settings import CONTACT_EMAIL_LENGTH

class ContactManager(models.Manager):
    def get_contacts_by_user(self, user_email):
        """Get a user's contacts.
        """
        return super(ContactManager, self).filter(user_email=user_email)

    def get_contact_by_user(self, user_email, contact_email):
        """Return a certern contact of ``user_email``.
        """
        try:
            c = super(ContactManager, self).get(user_email=user_email,
                                                contact_email=contact_email)
        except Contact.DoesNotExist:
            c = None
        return c

    def get_registered_contacts_by_user(self, user_email):
        """Get a user's registered contacts.

        Returns:
            A list contains contact emails.
        """
        contacts = [ c.contact_email for c in super(
                ContactManager, self).filter(user_email=user_email) ]
        emailusers = ccnet_threaded_rpc.filter_emailusers_by_emails(
            ','.join(contacts))

        return [ e.email for e in emailusers ]

class Contact(models.Model):
    """Record user's contacts."""

    user_email = models.CharField(max_length=CONTACT_EMAIL_LENGTH, db_index=True)
    contact_email = models.CharField(max_length=CONTACT_EMAIL_LENGTH)
    contact_name = models.CharField(max_length=255, blank=True, null=True, \
                                        default='')
    note = models.CharField(max_length=255, blank=True, null=True, default='')

    objects = ContactManager()

    def __unicode__(self):
        return self.contact_email
        
    # class Meta:
    #     unique_together = ("user_email", "contact_email")

class ContactAddForm(ModelForm):
    class Meta:
        model = Contact

    def clean(self):
        if not 'contact_email' in self.cleaned_data:
            raise forms.ValidationError(_('Email is required.'))
            
        user_email = self.cleaned_data['user_email']
        contact_email = self.cleaned_data['contact_email']
        if user_email == contact_email:
            raise forms.ValidationError(_("You can't add yourself."))
        elif Contact.objects.filter(user_email=user_email,
                                    contact_email=contact_email).count() > 0:
            raise forms.ValidationError(_("It is already your contact."))
        else:
            return self.cleaned_data

class ContactEditForm(ModelForm):
    class Meta:
        model = Contact
    
    def __init__(self, *args, **kwargs):
        super(ContactEditForm, self).__init__(*args, **kwargs)
        self.fields['contact_email'].widget.attrs['readonly'] = True

    def clean(self):
        # This is used to override unique index check
        return self.cleaned_data
