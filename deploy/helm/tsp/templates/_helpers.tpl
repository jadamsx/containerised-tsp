{{- define "tsp.image" -}}
{{ .root.Values.image.repository }}/{{ .name }}:{{ .root.Values.image.tag | default .root.Chart.AppVersion }}
{{- end }}
