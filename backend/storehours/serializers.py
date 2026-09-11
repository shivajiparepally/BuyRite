from rest_framework import serializers

from .models import StoreHours


class StoreHoursSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = StoreHours
        fields = ["id", "day_of_week", "day_name", "open_time", "close_time", "is_closed"]
