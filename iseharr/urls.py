from django.contrib.auth.decorators import login_required
from django.conf.urls import patterns, url, include
from django.views.generic.base import TemplateView

urlpatterns = patterns('',
    url(r'^$', login_required(TemplateView.as_view(template_name='iseharr/index.html'))),
    url(r'^socket/$', login_required(TemplateView.as_view(template_name='iseharr/socket_test.html'))),
    url(r'^time/$', login_required(TemplateView.as_view(template_name='iseharr/time.html'))),
)
