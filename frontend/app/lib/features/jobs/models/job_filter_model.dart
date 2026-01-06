class JobFilterModel {
  final String sector;
  final String positionType;
  final String applicationStatus;
  final String sortBy;

  const JobFilterModel({
    this.sector = 'All Sectors',
    this.positionType = 'All',
    this.applicationStatus = 'All',
    this.sortBy = 'Newest',
  });

  JobFilterModel copyWith({
    String? sector,
    String? positionType,
    String? applicationStatus,
    String? sortBy,
  }) {
    return JobFilterModel(
      sector: sector ?? this.sector,
      positionType: positionType ?? this.positionType,
      applicationStatus: applicationStatus ?? this.applicationStatus,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}