import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formUser, setFormUser] = useState({ 
    name: '', 
    email: '', 
    rollNo: '', 
    role: 'student',
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
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all');
  const [clubs, setClubs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch users and clubs on component mount
  useEffect(() => {
    fetchUsers();
    fetchClubs();
  }, []);

  // Filter users when search term or filters change
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by year (for students)
    if (yearFilter !== 'all') {
      filtered = filtered.filter(user => user.year && user.year.toString() === yearFilter);
    }

    // Filter by branch
    if (branchFilter !== 'all') {
      filtered = filtered.filter(user => user.branch && user.branch.toLowerCase() === branchFilter.toLowerCase());
    }

    // Filter by club (students by joined clubs, coordinators by coordinatingClub)
    if (clubFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (user.role === 'student') {
          const clubIds = Array.isArray(user.clubs)
            ? user.clubs.map(c => (typeof c === 'string' ? c : (c && (c._id || (c.toString && c.toString())))))
            : [];
          return clubIds.includes(clubFilter);
        }
        if (user.role === 'coordinator') {
          const coordClubId = typeof user.coordinatingClub === 'string'
            ? user.coordinatingClub
            : (user.coordinatingClub && user.coordinatingClub._id);
          return coordClubId === clubFilter;
        }
        return false;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, roleFilter, yearFilter, branchFilter, clubFilter]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all clubs
  const fetchClubs = async () => {
    try {
      const response = await axios.get('/api/clubs');
      setClubs(response.data);
    } catch (err) {
      console.error('Error fetching clubs:', err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser({ ...formUser, [name]: value });
  };

  // Add or edit user
  const handleSaveUser = async () => {
    try {
      setError('');
      setSuccess('');

      if (editingUser) {
        // Edit existing user
        const updateData = { ...formUser };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        await axios.put(`/api/users/${editingUser._id}`, updateData);
        setSuccess('User updated successfully!');
      } else {
        // Add new user
        await axios.post('/api/users', formUser);
        setSuccess('User created successfully!');
      }
      
      fetchUsers();
      closeModal();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user. Please try again.');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
      try {
      setError('');
      await axios.delete(`/api/users/${userToDelete._id}`);
      setSuccess('User deleted successfully!');
        fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
      } catch (err) {
        console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user. Please try again.');
    }
  };

  // Open modal for add
  const handleAddUser = () => {
    setFormUser({ 
      name: '', 
      email: '', 
      rollNo: '', 
      role: 'student',
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

  // Open modal for edit
  const handleEditUser = (user) => {
    setFormUser({ 
      name: user.name || '', 
      email: user.email || '', 
      rollNo: user.rollNo || '',
      role: user.role || 'student',
      year: user.year || '',
      branch: user.branch || '',
      section: user.section || '',
      password: '' // Don't pre-fill password
    });
    setEditingUser(user);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormUser({ 
      name: '', 
      email: '', 
      rollNo: '', 
      role: 'student',
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

  // Get current page users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredUsers.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student': return 'Student';
      case 'coordinator': return 'Coordinator';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'student': return styles.roleStudent;
      case 'coordinator': return styles.roleCoordinator;
      case 'admin': return styles.roleAdmin;
      default: return '';
    }
  };

  // Get unique branches from users
  const getUniqueBranches = () => {
    const branches = users
      .filter(user => user.branch)
      .map(user => user.branch)
      .filter((branch, index, self) => self.indexOf(branch) === index)
      .sort();
    return branches;
  };

  // Predefined branches
  const predefinedBranches = ['CSE', 'CSM', 'IT', 'CSD'];

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setYearFilter('all');
    setBranchFilter('all');
    setClubFilter('all');
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (roleFilter !== 'all') count++;
    if (yearFilter !== 'all') count++;
    if (branchFilter !== 'all') count++;
    if (clubFilter !== 'all') count++;
    return count;
  };

  if (loading) {
    return (
      <div className={styles.dashboardHome}>
        <div className={styles.section}>
          <div className="loading">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>User Management</h1>
        <p>Manage all users in the KMIT Club Hub system</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter(u => u.role === 'student').length}</h3>
          <p>Students</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter(u => u.role === 'coordinator').length}</h3>
          <p>Coordinators</p>
        </div>
        <div className={styles.statCard}>
          <h3>{users.filter(u => u.role === 'admin').length}</h3>
          <p>Admins</p>
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
              placeholder="Search users by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.formControl}
              style={{ minWidth: '300px' }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.formControl}
              style={{ minWidth: '150px' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="coordinator">Coordinators</option>
              <option value="admin">Admins</option>
            </select>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: 'bold' }}>According to Club:</label>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className={styles.formControl}
              style={{ minWidth: '200px' }}
            >
              <option value="all">All Clubs</option>
              {clubs.map(club => (
                <option key={club._id} value={club._id}>{club.name}</option>
              ))}
            </select>
          </div>
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
              setRoleFilter('student');
              setYearFilter('all');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={roleFilter === 'student' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍🎓 Students ({users.filter(u => u.role === 'student').length})
          </button>
          <button
            onClick={() => {
              setRoleFilter('coordinator');
              setYearFilter('all');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={roleFilter === 'coordinator' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍💼 Coordinators ({users.filter(u => u.role === 'coordinator').length})
          </button>
          <button
            onClick={() => {
              setRoleFilter('admin');
              setYearFilter('all');
              setBranchFilter('all');
              setSearchTerm('');
            }}
            className={roleFilter === 'admin' ? styles.submitBtn : styles.cancelBtn}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            👨‍💻 Admins ({users.filter(u => u.role === 'admin').length})
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
                setRoleFilter('student');
                setYearFilter('all');
                setSearchTerm('');
              }}
              className={branchFilter === branch ? styles.submitBtn : styles.cancelBtn}
              style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
            >
              {branch} ({users.filter(u => u.branch === branch).length})
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
            {roleFilter !== 'all' && <span style={{ marginLeft: '0.5rem', background: '#4caf50', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Role: {getRoleDisplayName(roleFilter)}</span>}
            {yearFilter !== 'all' && <span style={{ marginLeft: '0.5rem', background: '#ff9800', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Year: {yearFilter}</span>}
            {branchFilter !== 'all' && <span style={{ marginLeft: '0.5rem', background: '#9c27b0', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Branch: {branchFilter}</span>}
          </div>
        )}

        {/* Users Table */}
        <div className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <div>Name</div>
            <div>Email</div>
            <div>Roll No</div>
            <div>Role</div>
            <div>Details</div>
            <div>Actions</div>
          </div>
          
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <div key={user._id || index} className={styles.tableRow}>
                <div>
                  <strong>{user.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    {user.role === 'coordinator' && user.coordinatingClub ? 
                      `Coordinating: ${user.coordinatingClub.name}` : 
                      user.role === 'student' && user.clubs && user.clubs.length > 0 ? 
                        `Clubs: ${user.clubs.length}` : 
                        'No club assigned'}
                  </div>
                </div>
                <div>{user.email}</div>
                <div>{user.rollNo}</div>
                <div>
                  <span className={`${styles.role} ${getRoleBadgeClass(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <div>
                  {user.role === 'student' && user.year && user.branch ? (
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      <div>Year: {user.year}</div>
                      <div>Branch: {user.branch}</div>
                      {user.section && <div>Section: {user.section}</div>}
                    </div>
                  ) : user.role === 'coordinator' ? (
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      <div>Coordinator</div>
                      {user.coordinatingClub && <div>Club: {user.coordinatingClub.name}</div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      System Administrator
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEditUser(user)}
                    className={styles.editBtn}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className={styles.deleteBtn}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <h3>No users found</h3>
              <p>No users match your current search criteria.</p>
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

      {/* Add/Edit User Modal */}
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
              {editingUser ? 'Edit User' : 'Add New User'}
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
                    <label>Role *</label>
                    <select
                      name="role"
                      value={formUser.role}
                      onChange={handleChange}
                      className={styles.formControl}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

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
                </div>

                <div className={styles.formRow}>
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
                  <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formUser.password}
                    onChange={handleChange}
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                    className={styles.formControl}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveUser} className={styles.submitBtn}>
            {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
            <h2 style={{ marginBottom: '1rem', color: '#e74c3c' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: '#7f8c8d' }}>
              Are you sure you want to delete user <strong>{userToDelete.name}</strong>? 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={closeDeleteModal} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDeleteUser} className={styles.deleteBtn}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
