FROM bitnami/openldap:latest
# COPY ./output.ldif /ldifs/output.ldif
# ENV LDAP_SKIP_DEFAULT_TREE=no
# ENV LDAP_CUSTOM_LDIF_DIR=/ldifs/output.ldif
ENV TZ=Asia/Jakarta
ENV LDAP_ROOT=dc=NTTAPAC,dc=COM
ENV LDAP_USER_DC=NTTI
ENV LDAP_GROUP=NOC
ENV LDAP_ADMIN_USERNAME=admin
ENV LDAP_ADMIN_PASSWORD=HCHUgn2nn6
ENV LDAP_USERS=nining.lapinasari,aji.sampurno,arda.razianto,rahmad.hidayat,shabran.ahmad,danny.ardiansyah,abdulrahman.soleh,aditya.pamungkas,akmal.ahfa,caesar.novianto,eka.eldina,ngatriyono.kasmuri
ENV LDAP_PASSWORDS=NTTI@2022,NTTI@2023,NTTI@2024,NTTI@2025,NTTI@2026,NTTI@2027,NTTI@2028,NTTI@2029,NTTI@2030,NTTI@2031,NTTI@2032,NTTI@2033
