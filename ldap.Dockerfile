FROM bitnami/openldap:latest
COPY ./output.ldif /ldifs/output.ldif
ENV LDAP_SKIP_DEFAULT_TREE=no
ENV LDAP_CUSTOM_LDIF_DIR=/ldifs/output.ldif
ENV LDAP_ADMIN_USERNAME=admin
ENV LDAP_ADMIN_PASSWORD=adminpassword
# RUN ldapadd -Z -D "dc=NTT,dc=COM" -w ${LDAP_ADMIN_PASSWORD} -f /ldifs/output.ldif
# ldapadd -Z -D "dc=NTT,dc=COM" -w $LDAP_ADMIN_PASSWORD -f /ldifs