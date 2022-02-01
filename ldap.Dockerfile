FROM bitnami/openldap:latest
# COPY ./output.ldif /ldifs/output.ldif
# ENV LDAP_SKIP_DEFAULT_TREE=no
# ENV LDAP_CUSTOM_LDIF_DIR=/ldifs/output.ldif
ENV LDAP_ROOT=dc=NTTAPAC,dc=COM
ENV LDAP_USER_DC=NTTI
ENV LDAP_GROUP=NOC
ENV LDAP_ADMIN_USERNAME=admin
ENV LDAP_ADMIN_PASSWORD=adminpassword
ENV LDAP_USERS=user01,user02
ENV LDAP_PASSWORDS=password1,password2