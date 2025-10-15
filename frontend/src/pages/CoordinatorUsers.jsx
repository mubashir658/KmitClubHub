import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from './Dashboard.module.css';

const CoordinatorUsers = () => {
  const { user } = useAuth();
  const [clubMembers, setClubMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formUser, setFormUser] = useState({ 
    name: '', 
    email: '', 
    rollNo: '', 
    year: '',
    branch: '',
    section: '',
    password: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch club members on component mount
  useEffect(() => {
    fetchClubMembers();
  }, []);

  // Filter members when search term or filters change
  useEffect(() => {
    let filtered = clubMembers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filtered = filtered.filter(member => member.year && member.year.toString() === yearFilter);
    }

    // Filter by branch
    if (branchFilter !== 'all') {
      filtered = filtered.filter(member => member.branch && member.branch.toLowerCase() === branchFilter.toLowerCase());
    }

    setFilteredMembers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [clubMembers, searchTerm, yearFilter, branchFilter]);

  // Fetch club members
  const fetchClubMembers = async () => {
    setLoading(true);
    try {
      if (!user.coordinatingClub) {
        setError('No club assigned to this coordinator');
        return;
      }

      const response = await axios.get(`/api/clubs/${user.coordinatingClub}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClubMembers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching club members:', err);
      setError('Failed to load club members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser({ ...formUser, [name]: value });
  };

  // Add new member (invite)
  const handleInviteMember = async () => {
    try {
      setError('');
      setSuccess('');

      // Add member to club
      await axios.post(`/api/clubs/${user.coordinatingClub}/invite`, formUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSuccess('Member invited successfully!');
      fetchClubMembers();
      closeModal();
    } catch (err) {
      console.error('Error inviting member:', err);
      setError(err.response?.data?.message || 'Failed to invite member. Please try again.');
    }
  };

  // Remove member from club
  const handleRemoveMember = async () => {
    if (!userToDelete) return;
    
    try {
      setError('');
      await axios.delete(`/api/clubs/${user.coordinatingClub}/members/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Member removed successfully!');
      fetchClubMembers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err.response?.data?.message || 'Failed to remove member. Please try again.');
    }
  };

  // Open modal for invite
  const handleInviteMemberClick = () => {
    setFormUser({ 
      name: '', 
      email: '', 
      rollNo: '', 
      year: '',
      branch: '',
      section: '',
      password: ''
    });
    setEditingUser(null);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // Open delete confirmation modal
  const handleRemoveClick = (member) => {
    setUserToDelete(member);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormUser({ 
      name: '', 
      email: '', 
      rollNo: '', 
      year: '',
      branch: '',
      section: '',
      password: ''
    });
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Get current page members
  const indexOfLastMember = currentPage * usersPerPage;
  const indexOfFirstMember = indexOfLastMember - usersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredMembers.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  // Get unique branches from members
  const getUniqueBranches = () => {
    const branches = clubMembers
      .filter(member => member.branch)
      .map(member => member.branch)
      .filter((branch, index, self) => self.indexOf(branch) === index)
      .sort();
    return branches;
  };

  // Predefined branches
  const predefinedBranches = ['CSE', 'CSM', 'IT', 'CSD'];

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setYearFilter('all');
    setBranchFilter('all');
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (yearFilter !== 'all') count++;
    if (branchFilter !== 'all') count++;
    return count;
  };

  if (loading) {
    return (
      <div className={styles.dashboardHome}>
        <div className={styles.section}>
          <div className="loading">Loading club members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Member Management</h1>
        <p>Manage members in your club</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{clubMembers.length}</h3>
          <p>Total Members</p>
        </div>
        <div className={styles.statCard}>
          <h3>{clubMembers.filter(m => m.year === 1).length}</h3>
          <p>1st Year</p>
        </div>
        <div className={styles.statCard}>
          <h3>{clubMembers.filter(m => m.year === 2).length}</h3>
          <p>2nd Year</p>
        </div>
        <div className={styles.statCard}>
          <h3>{clubMembers.filter(m => m.year === 3).length}</h3>
          <p>3rd Year</p>
        </div>
        <div className={styles.statCard}>
          <h3>{clubMembers.filter(m => m.year === 4).length}</h3>
          <p>4th Year</p>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className={styles.error}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className={styles.section}>
        <div className={styles.filterControls}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search members by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.formControl}
              style={{ minWidth: '300px' }}
            />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className={styles.formControl}
              style={{ minWidth: '120px' }}
            >
              <option value="all">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className={styles.formControl}
              style={{ minWidth: '120px' }}
            >
              <option value="all">All Branches</option>
              {predefinedBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            {getActiveFiltersCount() > 0 && (
              <button 
                onClick={clearAllFilters} 
                className={styles.cancelBtn}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Clear Filters ({getActiveFiltersCount()})
              </button>
            )}
          </div>
          <button onClick={handleInviteMemberClick} className={styles.submitBtn}>
            + Invite New Member
          </button>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1rem', 
          flexWrap: 'wrap' 
        }}>
          <button
            onClick={() => {
              setYearFilter('1');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={yearFilter === '1' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍🎓 1st Year ({clubMembers.filter(m => m.year === 1).length})
          </button>
          <button
            onClick={() => {
              setYearFilter('2');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={yearFilter === '2' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍🎓 2nd Year ({clubMembers.filter(m => m.year === 2).length})
          </button>
          <button
            onClick={() => {
              setYearFilter('3');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={yearFilter === '3' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍🎓 3rd Year ({clubMembers.filter(m => m.year === 3).length})
          </button>
          <button
            onClick={() => {
              setYearFilter('4');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={yearFilter === '4' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍🎓 4th Year ({clubMembers.filter(m => m.year === 4).length})
          </button>
          <button
            onClick={clearAllFilters}
            className={styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            🔄 Show All
          </button>
        </div>

        {/* Branch Quick Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1rem', 
          flexWrap: 'wrap' 
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#2c3e50',
            marginRight: '0.5rem',
            alignSelf: 'center'
          }}>
            Quick Branch Filters:
          </span>
          {predefinedBranches.map(branch => (
            <button
              key={branch}
              onClick={() => {
                setBranchFilter(branch);
                setYearFilter('all');
                setSearchTerm('');
              }}
              className={branchFilter === branch ? styles.submitBtn : styles.cancelBtn}
              style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
            >
              {branch} ({clubMembers.filter(m => m.branch === branch).length})
            </button>
          ))}
        </div>

        {/* Filter Summary */}
        {getActiveFiltersCount() > 0 && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#e3f2fd', 
            borderRadius: '8px',
            border: '1px solid #bbdefb'
          }}>
            <strong>Active Filters:</strong>
            {searchTerm && <span style={{ marginLeft: '0.5rem', background: '#2196f3', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Search: "{searchTerm}"</span>}
            {yearFilter !== 'all' && <span style={{ marginLeft: '0.5rem', background: '#4caf50', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Year: {yearFilter}</span>}
            {branchFilter !== 'all' && <span style={{ marginLeft: '0.5rem', background: '#9c27b0', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Branch: {branchFilter}</span>}
          </div>
        )}

        {/* Members Table */}
        <div className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <div>Name</div>
            <div>Email</div>
            <div>Roll No</div>
            <div>Year</div>
            <div>Branch</div>
            <div>Actions</div>
          </div>
          
          {currentMembers.length > 0 ? (
            currentMembers.map((member, index) => (
              <div key={member._id || index} className={styles.tableRow}>
                <div>
                  <strong>{member.name}</strong>
                </div>
                <div>{member.email}</div>
                <div>{member.rollNo}</div>
                <div>{member.year}</div>
                <div>{member.branch}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleRemoveClick(member)}
                    className={styles.deleteBtn}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <h3>No members found</h3>
              <p>No members match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pageNumbers.length > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            marginTop: '2rem' 
          }}>
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={currentPage === number ? styles.submitBtn : styles.cancelBtn}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
              Invite New Member
            </h2>
            
            <div className={styles.formContainer}>
              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formUser.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={styles.formControl}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formUser.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={styles.formControl}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formUser.rollNo}
                    onChange={handleChange}
                    placeholder="Enter roll number"
                    className={styles.formControl}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Year</label>
                    <select
                      name="year"
                      value={formUser.year}
                      onChange={handleChange}
                      className={styles.formControl}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Branch</label>
                    <select
                      name="branch"
                      value={formUser.branch}
                      onChange={handleChange}
                      className={styles.formControl}
                    >
                      <option value="">Select Branch</option>
                      {predefinedBranches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Section</label>
                    <select
                      name="section"
                      value={formUser.section}
                      onChange={handleChange}
                      className={styles.formControl}
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formUser.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={styles.formControl}
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleInviteMember} className={styles.submitBtn}>
                  Invite Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#e74c3c' }}>Confirm Remove</h2>
            <p style={{ marginBottom: '1.5rem', color: '#7f8c8d' }}>
              Are you sure you want to remove <strong>{userToDelete.name}</strong> from the club? 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={closeDeleteModal} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleRemoveMember} className={styles.deleteBtn}>
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorUsers;
